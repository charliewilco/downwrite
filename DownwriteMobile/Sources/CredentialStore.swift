import Foundation
import Security

struct SavedCredentials: Codable, Equatable {
	var instanceURL: URL
	var apiBase: String
	var token: String
}

protocol CredentialStore {
	func load() throws -> SavedCredentials?
	func save(_ credentials: SavedCredentials) throws
	func clear() throws
}

struct KeychainCredentialStore: CredentialStore {
	private let service = "com.charliewilco.downwrite.mobile"
	private let account = "session"

	func load() throws -> SavedCredentials? {
		var query = baseQuery()
		query[kSecReturnData as String] = true
		query[kSecMatchLimit as String] = kSecMatchLimitOne

		var item: CFTypeRef?
		let status = SecItemCopyMatching(query as CFDictionary, &item)
		if status == errSecItemNotFound {
			return nil
		}
		guard status == errSecSuccess, let data = item as? Data else {
			throw KeychainError.unhandled(status)
		}
		return try JSONDecoder.downwrite.decode(SavedCredentials.self, from: data)
	}

	func save(_ credentials: SavedCredentials) throws {
		let data = try JSONEncoder.downwrite.encode(credentials)
		var query = baseQuery()
		query[kSecValueData as String] = data

		let status = SecItemAdd(query as CFDictionary, nil)
		if status == errSecDuplicateItem {
			let updateStatus = SecItemUpdate(baseQuery() as CFDictionary, [kSecValueData as String: data] as CFDictionary)
			guard updateStatus == errSecSuccess else {
				throw KeychainError.unhandled(updateStatus)
			}
			return
		}
		guard status == errSecSuccess else {
			throw KeychainError.unhandled(status)
		}
	}

	func clear() throws {
		let status = SecItemDelete(baseQuery() as CFDictionary)
		if status != errSecSuccess && status != errSecItemNotFound {
			throw KeychainError.unhandled(status)
		}
	}

	private func baseQuery() -> [String: Any] {
		[
			kSecClass as String: kSecClassGenericPassword,
			kSecAttrService as String: service,
			kSecAttrAccount as String: account
		]
	}
}

enum KeychainError: Error, Equatable {
	case unhandled(OSStatus)
}

extension KeychainError: LocalizedError {
	var errorDescription: String? {
		switch self {
		case let .unhandled(status):
			"Keychain failed with status \(status)."
		}
	}
}

struct InMemoryCredentialStore: CredentialStore {
	var stored: SavedCredentials?

	func load() throws -> SavedCredentials? {
		stored
	}

	func save(_ credentials: SavedCredentials) throws {}

	func clear() throws {}
}
