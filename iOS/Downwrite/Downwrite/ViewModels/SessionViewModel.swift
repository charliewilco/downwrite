import Foundation
import Observation

@Observable
final class SessionViewModel {
    enum State: Equatable {
        case signedOut
        case signedIn(InstanceSession)
    }

    private(set) var state: State

    init(state: State = .signedOut) {
        self.state = state
    }

    var activeSession: InstanceSession? {
        guard case .signedIn(let session) = state else {
            return nil
        }
        return session
    }

    func signIn(instanceURL: URL, accessToken: String?, identity: Identity?) {
        let client = URLSessionDownwriteAPIClient(baseURL: instanceURL, accessToken: accessToken)
        state = .signedIn(InstanceSession(instanceURL: instanceURL, identity: identity, apiClient: client))
    }

    func signIn(session: InstanceSession) {
        state = .signedIn(session)
    }

    func signOut() {
        state = .signedOut
    }
}

struct InstanceSession: Equatable {
    let instanceURL: URL
    let identity: Identity?
    var apiClient: any DownwriteAPIClient

    static func == (lhs: InstanceSession, rhs: InstanceSession) -> Bool {
        lhs.instanceURL == rhs.instanceURL && lhs.identity == rhs.identity
    }
}

extension SessionViewModel {
    static let previewSignedOut = SessionViewModel()

    static let previewSignedIn = SessionViewModel(
        state: .signedIn(
            InstanceSession(
                instanceURL: URL(string: "http://localhost:8787")!,
                identity: Identity(id: "local-owner"),
                apiClient: PreviewDownwriteAPIClient.sample
            )
        )
    )
}
