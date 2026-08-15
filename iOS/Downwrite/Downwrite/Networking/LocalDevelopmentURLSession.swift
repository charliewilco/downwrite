import Foundation

final class LocalDevelopmentURLSession: @unchecked Sendable {
	let cookieStorage: HTTPCookieStorage
	let urlSession: URLSession

	init() {
		let configuration = URLSessionConfiguration.ephemeral
		configuration.httpShouldSetCookies = true
		guard let cookieStorage = configuration.httpCookieStorage else {
			preconditionFailure("Ephemeral URL sessions require isolated cookie storage.")
		}

		self.cookieStorage = cookieStorage
		urlSession = URLSession(configuration: configuration)
	}

	func signOut() async {
		await withCheckedContinuation { continuation in
			urlSession.reset { [cookieStorage, urlSession] in
				cookieStorage.cookies?.forEach(cookieStorage.deleteCookie)
				urlSession.invalidateAndCancel()
				continuation.resume()
			}
		}
	}
}
