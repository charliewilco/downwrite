import SwiftUI

struct WorkspaceShellView: View {
    @State var viewModel: WorkspaceViewModel

    var body: some View {
        NavigationSplitView {
            GroupListView(viewModel: viewModel)
        } content: {
            if let group = viewModel.selectedGroup {
                GroupDetailView(group: group, viewModel: viewModel)
            } else {
                ContentUnavailableView("Select a Group", systemImage: "folder")
            }
        } detail: {
            if let documentID = viewModel.selectedDocumentID {
                DocumentDetailView(viewModel: DocumentViewModel(documentID: documentID, session: viewModel.session))
                    .id(documentID)
            } else {
                ContentUnavailableView("Select a Document", systemImage: "doc.text")
            }
        }
        .task {
            await viewModel.loadGroups()
        }
        .sheet(item: $viewModel.groupEditor) { editor in
            GroupEditorView(viewModel: editor) { updated in
                viewModel.applyEditedGroup(updated)
                viewModel.groupEditor = nil
            }
        }
        .sheet(item: $viewModel.groupReassignment) { reassignment in
            GroupReassignmentView(viewModel: reassignment) { result in
                viewModel.removeGroup(result.removedGroupID, replacementGroup: result.replacementGroup)
                viewModel.groupReassignment = nil
            }
        }
    }
}

#Preview("Workspace") {
    WorkspaceShellView(viewModel: AppViewModel.previewSignedIn.workspaceModel)
}
