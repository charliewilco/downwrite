import Foundation
import Testing

@testable import Downwrite

@MainActor
struct MarkdownImportTests {
	@Test func loadsMarkdownFilesInSelectionOrderAndDerivesTitles() async throws {
		let fixture = try MarkdownFileFixture([
			("release-notes.md", "# Release\n"),
			("api_reference.markdown", "# API\n"),
		])
		defer { fixture.remove() }

		let files = try await MarkdownImportFileLoader.loadFiles(from: fixture.urls)

		#expect(files.map(\.fileName) == ["release-notes.md", "api_reference.markdown"])
		#expect(files.map(\.title) == ["release notes", "api reference"])
		#expect(files.map(\.content) == ["# Release\n", "# API\n"])
	}

	@Test func rejectsNonMarkdownFilesEvenWhenDirectlyProvided() async throws {
		let fixture = try MarkdownFileFixture([("notes.txt", "Not Markdown")])
		defer { fixture.remove() }

		await #expect(throws: MarkdownImportFileError.unsupportedFile("notes.txt")) {
			try await MarkdownImportFileLoader.loadFiles(from: fixture.urls)
		}
	}

	@Test func importsFilesSequentiallyAndSelectsTheLastDocument() async throws {
		let client = PreviewDownwriteAPIClient.markdownImportSampleCopy()
		let workspace = try #require(client.groups.first)
		let viewModel = preparedViewModel(client: client, workspace: workspace)

		let imported = await viewModel.importRemainingFiles()

		#expect(client.createDocumentInputs == [
			PreviewDocumentCreation(groupID: workspace.id, title: "First", content: "# First"),
			PreviewDocumentCreation(groupID: workspace.id, title: "Second", content: "# Second"),
		])
		#expect(imported.count == 2)
		#expect(viewModel.isComplete)
		let workspaceViewModel = WorkspaceViewModel(session: .markdownImportSignedIn(client: client))
		workspaceViewModel.applyImportedDocuments(imported)
		#expect(workspaceViewModel.selectedGroupID == workspace.id)
		#expect(workspaceViewModel.selectedDocumentID == imported.last?.id)
		#expect(workspaceViewModel.selectedGroup?.documents.contains { $0.id == imported[0].id } == true)
		#expect(workspaceViewModel.selectedGroup?.documents.contains { $0.id == imported[1].id } == true)
	}

	@Test func importSubmissionIsSingleFlight() async throws {
		let client = PreviewDownwriteAPIClient.markdownImportSampleCopy()
		client.createDocumentDelay = .milliseconds(30)
		let workspace = try #require(client.groups.first)
		let viewModel = preparedViewModel(client: client, workspace: workspace)

		let first = Task { await viewModel.importRemainingFiles() }
		await waitUntil { viewModel.isImporting }
		let second = await viewModel.importRemainingFiles()
		let imported = await first.value

		#expect(second.isEmpty)
		#expect(imported.count == 2)
		#expect(client.createDocumentCallCount == 2)
	}

	@Test func definitivePartialFailureRetriesOnlyTheRemainingFile() async throws {
		let client = PreviewDownwriteAPIClient.markdownImportSampleCopy()
		client.createDocumentErrors[2] = DownwriteErrorEnvelope(
			error: "Document creation is unavailable",
			code: "forbidden",
			status: 403
		)
		let workspace = try #require(client.groups.first)
		let viewModel = preparedViewModel(client: client, workspace: workspace)

		let firstAttempt = await viewModel.importRemainingFiles()

		#expect(firstAttempt.count == 1)
		#expect(viewModel.remainingCount == 1)
		#expect(viewModel.isOutcomeUncertain == false)
		#expect(viewModel.canImport)

		client.createDocumentErrors = [:]
		let secondAttempt = await viewModel.importRemainingFiles()

		#expect(secondAttempt.count == 1)
		#expect(secondAttempt.first?.title == "Second")
		#expect(client.createDocumentInputs.map(\.title) == ["First", "Second", "Second"])
		#expect(viewModel.isComplete)
	}

	@Test func ambiguousCommittedCreateFreezesRetryUntilWorkspaceRefresh() async throws {
		let client = PreviewDownwriteAPIClient.markdownImportSampleCopy()
		client.createDocumentCommittedError = URLError(.networkConnectionLost)
		let workspace = try #require(client.groups.first)
		let viewModel = preparedViewModel(client: client, workspace: workspace)

		let imported = await viewModel.importRemainingFiles()
		let retry = await viewModel.importRemainingFiles()

		#expect(imported.isEmpty)
		#expect(retry.isEmpty)
		#expect(viewModel.isOutcomeUncertain)
		#expect(viewModel.canImport == false)
		#expect(client.createDocumentCallCount == 1)
		#expect(client.groups.first?.documents.filter { $0.title == "First" }.count == 1)
	}

	private func preparedViewModel(
		client: PreviewDownwriteAPIClient,
		workspace: GroupSummary
	) -> MarkdownImportViewModel {
		let viewModel = MarkdownImportViewModel(
			urls: [],
			workspace: workspace,
			session: .markdownImportSignedIn(client: client)
		)
		viewModel.filesState = .loaded([
			MarkdownImportFile(
				id: "first.md",
				fileName: "first.md",
				title: "First",
				content: "# First",
				byteCount: 7
			),
			MarkdownImportFile(
				id: "second.md",
				fileName: "second.md",
				title: "Second",
				content: "# Second",
				byteCount: 8
			),
		])
		return viewModel
	}

	private func waitUntil(
		timeout: Duration = .seconds(1),
		_ condition: () -> Bool
	) async {
		let clock = ContinuousClock()
		let deadline = clock.now.advanced(by: timeout)
		while !condition(), clock.now < deadline {
			try? await Task.sleep(for: .milliseconds(2))
		}
	}
}

private struct MarkdownFileFixture {
	let directoryURL: URL
	let urls: [URL]

	init(_ files: [(name: String, content: String)]) throws {
		let directoryURL = FileManager.default.temporaryDirectory
			.appending(path: "downwrite-markdown-import-\(UUID().uuidString)", directoryHint: .isDirectory)
		try FileManager.default.createDirectory(
			at: directoryURL,
			withIntermediateDirectories: true
		)
		let urls = try files.map { file in
			let url = directoryURL.appending(path: file.name)
			try file.content.write(to: url, atomically: true, encoding: .utf8)
			return url
		}
		self.directoryURL = directoryURL
		self.urls = urls
	}

	func remove() {
		try? FileManager.default.removeItem(at: directoryURL)
	}
}

private extension PreviewDownwriteAPIClient {
	static func markdownImportSampleCopy() -> PreviewDownwriteAPIClient {
		PreviewDownwriteAPIClient(groups: sample.groups, documents: sample.documents)
	}
}

private extension SessionViewModel {
	@MainActor
	static func markdownImportSignedIn(client: PreviewDownwriteAPIClient) -> SessionViewModel {
		SessionViewModel(
			state: .signedIn(
				InstanceSession(
					instanceURL: client.baseURL,
					identity: Identity(id: "markdown-import-owner"),
					apiClient: client
				)
			),
			draftStore: .testStore()
		)
	}
}
