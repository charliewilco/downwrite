import Foundation
import Security

struct OAuthCredential: Codable, Equatable, Sendable {
    let instanceURL: URL
    let accessToken: String
    let refreshToken: String
    let accessTokenExpiresAt: Date
    let refreshTokenExpiresAt: Date
    let scope: String
    let resource: String

    init(instanceURL: URL, response: OAuthTokenResponse, issuedAt: Date = .now) {
        self.instanceURL = instanceURL
        accessToken = response.accessToken
        refreshToken = response.refreshToken
        accessTokenExpiresAt = issuedAt.addingTimeInterval(TimeInterval(response.expiresIn))
        refreshTokenExpiresAt = issuedAt.addingTimeInterval(TimeInterval(response.refreshExpiresIn))
        scope = response.scope
        resource = response.resource
    }
}

extension OAuthCredential {
    var containsRequiredScopes: Bool {
        let grantedScopes = Set(scope.split(whereSeparator: \.isWhitespace).map(String.init))
        return Set(InstanceConfiguration.requestedScopes).isSubset(of: grantedScopes)
    }
}

protocol OAuthCredentialStore {
    func load() throws -> OAuthCredential?
    func save(_ credential: OAuthCredential) throws
    func delete() throws
}

struct KeychainOAuthCredentialStore: OAuthCredentialStore {
    private let service = "co.charliewil.Downwrite.oauth"
    private let account = "current-instance"

    func load() throws -> OAuthCredential? {
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: service,
            kSecAttrAccount as String: account,
            kSecReturnData as String: true,
            kSecMatchLimit as String: kSecMatchLimitOne,
        ]
        var result: CFTypeRef?
        let resultCode = SecItemCopyMatching(query as CFDictionary, &result)
        if resultCode == errSecItemNotFound {
            return nil
        }
        guard resultCode == errSecSuccess, let data = result as? Data else {
            throw KeychainCredentialError(resultCode)
        }
        return try JSONDecoder().decode(OAuthCredential.self, from: data)
    }

    func save(_ credential: OAuthCredential) throws {
        let data = try JSONEncoder().encode(credential)
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: service,
            kSecAttrAccount as String: account,
        ]
        let attributes: [String: Any] = [
            kSecValueData as String: data,
            kSecAttrAccessible as String: kSecAttrAccessibleAfterFirstUnlockThisDeviceOnly,
        ]
        let updateCode = SecItemUpdate(query as CFDictionary, attributes as CFDictionary)
        if updateCode == errSecSuccess {
            return
        }
        guard updateCode == errSecItemNotFound else {
            throw KeychainCredentialError(updateCode)
        }
        var insertion = query
        insertion.merge(attributes) { _, new in new }
        let insertionCode = SecItemAdd(insertion as CFDictionary, nil)
        guard insertionCode == errSecSuccess else {
            throw KeychainCredentialError(insertionCode)
        }
    }

    func delete() throws {
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: service,
            kSecAttrAccount as String: account,
        ]
        let resultCode = SecItemDelete(query as CFDictionary)
        guard resultCode == errSecSuccess || resultCode == errSecItemNotFound else {
            throw KeychainCredentialError(resultCode)
        }
    }
}

struct KeychainCredentialError: LocalizedError {
    let resultCode: OSStatus

    init(_ resultCode: OSStatus) {
        self.resultCode = resultCode
    }

    var errorDescription: String? {
        SecCopyErrorMessageString(resultCode, nil) as String? ?? "The saved Downwrite session could not be accessed."
    }
}
