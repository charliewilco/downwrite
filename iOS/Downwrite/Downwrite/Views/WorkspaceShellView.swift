import SwiftUI
import UniformTypeIdentifiers

struct WorkspaceShellView: View {
    @State var viewModel: WorkspaceViewModel

    var body: some View {
        NavigationSplitView {
            GroupListView(viewModel: viewModel)
        } content: {
            if let group = viewModel.selectedGroup {
                GroupDetailView(group: group, viewModel: viewModel)
            } else {
                ContentUnavailableView("Select a Workspace", systemImage: "folder")
            }
        } detail: {
            if let documentID = viewModel.selectedDocumentID {
				DocumentDetailView(
					viewModel: DocumentViewModel(
						documentID: documentID,
						session: viewModel.session,
						onDocumentUpdate: { document in
							viewModel.applyUpdatedDocument(document)
						},
						onDocumentMove: { document, sourceGroupID in
							viewModel.applyMovedDocument(document, from: sourceGroupID)
						}
					),
					workspaces: viewModel.groups
				) { document in
					viewModel.applyDeletedDocument(document)
				}
                    .id(documentID)
            } else {
                ContentUnavailableView("Select a Document", systemImage: "doc.text")
            }
        }
        .task {
            await viewModel.loadGroups()
        }
        .sheet(item: $viewModel.workspaceCreator) { creator in
            WorkspaceCreatorView(viewModel: creator) { workspace in
                viewModel.applyCreatedWorkspace(workspace)
            }
        }
        .sheet(item: $viewModel.groupEditor) { editor in
            GroupEditorView(viewModel: editor) { updated in
                viewModel.applyEditedGroup(updated)
                viewModel.groupEditor = nil
            }
        }
        .sheet(item: $viewModel.documentCreator) { creator in
            DocumentCreatorView(viewModel: creator) { document in
                viewModel.applyCreatedDocument(document)
                viewModel.documentCreator = nil
            }
        }
        .sheet(item: $viewModel.groupReassignment) { reassignment in
            GroupReassignmentView(viewModel: reassignment) { result in
                viewModel.removeGroup(result.removedGroupID, replacementGroup: result.replacementGroup)
                viewModel.groupReassignment = nil
            }
        }
		.sheet(item: $viewModel.markdownImporter, onDismiss: {
			Task { await viewModel.loadGroups() }
		}) { importer in
			MarkdownImportView(viewModel: importer) { documents in
				viewModel.applyImportedDocuments(documents)
			}
		}
		.fileImporter(
			isPresented: $viewModel.isSelectingMarkdownFiles,
			allowedContentTypes: Self.markdownContentTypes,
			allowsMultipleSelection: true
		) { result in
			viewModel.handleMarkdownFileSelection(result)
		}
		.alert(item: $viewModel.markdownImportFailure) { failure in
			Alert(
				title: Text("Could Not Select Files"),
				message: Text(failure.message),
				dismissButton: .default(Text("OK"))
			)
		}
    }

	private static var markdownContentTypes: [UTType] {
		let types = ["md", "markdown"].compactMap { UTType(filenameExtension: $0) }
		return types.isEmpty ? [.plainText] : types
	}
}

#Preview("Workspace") {
    WorkspaceShellView(viewModel: AppViewModel.previewSignedIn.workspaceModel)
}
