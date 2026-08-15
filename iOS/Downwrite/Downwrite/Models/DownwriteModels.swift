import Foundation

enum LoadState<Value> {
    case idle
    case loading
    case loaded(Value)
    case failed(String)
}

extension Role {
    var displayName: String {
        switch self {
        case .owner:
            "Owner"
        case .editor:
            "Editor"
        }
    }
}

extension GroupSummary {
    var documentCountText: String {
        switch documents.count {
        case 0:
            "No documents"
        case 1:
            "1 document"
        default:
            "\(documents.count) documents"
        }
    }
}

extension DocumentSummary {
    var updatedDate: Date? {
        ISO8601DateFormatter.downwrite.date(from: updatedAt)
    }
}

extension ISO8601DateFormatter {
    static let downwrite: ISO8601DateFormatter = {
        let formatter = ISO8601DateFormatter()
        formatter.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
        return formatter
    }()
}
