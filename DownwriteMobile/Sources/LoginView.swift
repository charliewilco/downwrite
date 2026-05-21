import SwiftUI

struct LoginView: View {
	let model: AppModel

	var body: some View {
		NavigationStack {
			Form {
				Section {
					TextField("Instance URL", text: Bindable(model).authForm.instanceURL)
						.textInputAutocapitalization(.never)
						.keyboardType(.URL)
						.autocorrectionDisabled()
						.disabled(model.validatedInstance != nil)

					if let instance = model.validatedInstance {
						LabeledContent("Instance", value: instance.validation.name)
						LabeledContent("API", value: instance.discovery.apiBase)
						Button {
							model.editInstanceURL()
						} label: {
							Label("Change Instance", systemImage: "pencil")
						}
					} else {
						Button {
							Task {
								await model.validateInstance()
							}
						} label: {
							if model.isValidatingInstance {
								Label("Validating", systemImage: "hourglass")
							} else {
								Label("Continue", systemImage: "checkmark.seal")
							}
						}
						.disabled(model.isValidatingInstance || model.authForm.instanceURL.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty)
					}
				}

				if model.validatedInstance != nil {
					Section {
						TextField("Email", text: Bindable(model).authForm.email)
							.textInputAutocapitalization(.never)
							.keyboardType(.emailAddress)
							.autocorrectionDisabled()
						SecureField("Password", text: Bindable(model).authForm.password)
					}
				}

				if let errorMessage = model.errorMessage {
					Text(errorMessage)
						.foregroundStyle(.red)
				}

				if model.validatedInstance != nil {
					Button {
						Task {
							await model.login()
						}
					} label: {
						Label("Log In", systemImage: "arrow.right.circle.fill")
					}
					.disabled(model.authForm.email.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty || model.authForm.password.isEmpty)
				}
			}
			.navigationTitle("Downwrite")
		}
	}
}

#Preview {
	LoginView(model: .previewSignedOut)
}
