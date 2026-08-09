import SwiftUI

struct LoginView: View {
    @State var viewModel: LoginViewModel

    var body: some View {
        NavigationStack {
            Form {
                Section {
                    TextField("Instance URL", text: $viewModel.instanceURLText)
                        .textInputAutocapitalization(.never)
                        .keyboardType(.URL)
                        .autocorrectionDisabled()
                } header: {
                    Text("Downwrite instance")
                }

                Section {
                    Button {
                        Task { await viewModel.signInWithOAuth() }
                    } label: {
						Label(
							viewModel.isSigningIn ? "Connecting…" : "Continue with OAuth",
							systemImage: "person.badge.key"
						)
                    }
                    .disabled(viewModel.isSigningIn)
                } footer: {
                    Text("Uses the instance-local OAuth authorization code flow with PKCE.")
                }

				#if DEBUG
                Section {
                    TextField("Identity", text: $viewModel.developmentIdentity)
                        .textInputAutocapitalization(.never)
                        .autocorrectionDisabled()
                    TextField("Display name", text: $viewModel.developmentDisplayName)
                    SecureField("Bearer token", text: $viewModel.developmentBearerToken)
                        .textInputAutocapitalization(.never)
                        .autocorrectionDisabled()
                    Button {
                        Task { await viewModel.signInForLocalDevelopment() }
                    } label: {
                        Label("Use local development session", systemImage: "hammer")
                    }
                    .disabled(viewModel.isSigningIn)
                } header: {
                    Text("Development")
                } footer: {
						Text(
							"For a local Worker, leave bearer token blank to use the localhost-only development session adapter."
						)
                }
				#endif

                if let statusMessage = viewModel.statusMessage {
                    Section {
                        Text(statusMessage)
                            .foregroundStyle(.secondary)
                    }
                }
            }
            .navigationTitle("Downwrite")
            .overlay {
                if viewModel.isSigningIn {
                    ProgressView()
                }
            }
        }
    }
}

#Preview("Login") {
    LoginView(viewModel: LoginViewModel(session: .previewSignedOut))
}
