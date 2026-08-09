import Foundation
import Testing

@testable import Downwrite

@MainActor
struct LocalDevelopmentSessionTests {
	@Test func signOutClearsIsolatedCookieBeforeIdentitySwitch() async throws {
		let localDevelopmentSession = LocalDevelopmentURLSession()
		let cookie = try #require(
			HTTPCookie(
				properties: [
					.originURL: URL(string: "http://localhost:4321")!,
					.path: "/",
					.name: "downwrite_session",
					.value: "old-session",
					.version: "0",
				]
			)
		)
		localDevelopmentSession.cookieStorage.setCookie(cookie)
		let client = PreviewDownwriteAPIClient(groups: [], documents: [:])
		let session = SessionViewModel(
			state: .signedIn(
				InstanceSession(
					instanceURL: client.baseURL,
					identity: Identity(id: "old-owner"),
					apiClient: client,
					signOutAction: {
						await localDevelopmentSession.signOut()
					}
				)
			),
			draftStore: .testStore()
		)

		#expect(localDevelopmentSession.cookieStorage.cookies?.contains(cookie) == true)
		#expect(
			HTTPCookieStorage.shared.cookies?.contains {
				$0.name == cookie.name && $0.value == cookie.value
			} != true
		)

		await session.signOut()
		session.signIn(
			instanceURL: client.baseURL,
			accessToken: "different-bearer",
			identity: Identity(id: "different-owner")
		)

		#expect(localDevelopmentSession.cookieStorage.cookies?.isEmpty != false)
		#expect(session.activeSession?.identity == Identity(id: "different-owner"))
	}
}
