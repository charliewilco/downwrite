import Foundation
import Observation

@Observable
final class DocumentMoveViewModel: Identifiable {
	let id = UUID()
	let documentTitle: String
	let candidateGroups: [GroupSummary]
	var targetGroupID: String
	var isMoving = false
	var statusMessage: String?

	private let moveAction: (String) async -> String?

	init(
		document: DocumentRecord,
		groups: [GroupSummary],
		moveAction: @escaping (String) async -> String?
	) {
		documentTitle = document.title
		candidateGroups = groups.filter { $0.id != document.groupId }
		targetGroupID = candidateGroups.first?.id ?? ""
		self.moveAction = moveAction
	}

	var canMove: Bool {
		!targetGroupID.isEmpty && !isMoving
	}

	func move() async -> Bool {
		guard canMove else {
			return false
		}
		isMoving = true
		statusMessage = nil
		defer { isMoving = false }
		statusMessage = await moveAction(targetGroupID)
		return statusMessage == nil
	}
}
