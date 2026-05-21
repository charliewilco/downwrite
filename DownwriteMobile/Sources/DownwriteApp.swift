import SwiftUI

@main
struct DownwriteApp: App {
	@State private var model: AppModel

	init() {
		_model = State(initialValue: AppModel(
			client: DownwriteAPIClient(),
			credentialStore: KeychainCredentialStore()
		))
	}

	var body: some Scene {
		WindowGroup {
			RootView(model: model)
		}
	}
}
