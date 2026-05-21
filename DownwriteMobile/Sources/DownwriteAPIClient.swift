import Foundation

struct DownwriteAPIClient {
	var urlSession: URLSession = .shared
	var decoder: JSONDecoder = .downwrite
	var encoder: JSONEncoder = .downwrite

	func discover(instanceURL: URL) async throws -> DiscoveryResponse {
		try await send(
			instanceURL: instanceURL,
			apiBase: "",
			endpoint: ".well-known/downwrite",
			method: "GET",
			token: nil,
			body: Optional<EmptyBody>.none
		)
	}

	func validateInstance(instanceURL: URL) async throws -> ValidatedInstance {
		let discovery = try await discover(instanceURL: instanceURL)
		let validation: InstanceValidationResponse = try await send(
			instanceURL: instanceURL,
			apiBase: discovery.apiBase,
			endpoint: "instance/validate",
			method: "GET",
			token: nil,
			body: Optional<EmptyBody>.none
		)
		guard validation.valid, validation.name == "Downwrite" else {
			throw APIClientError.invalidInstance
		}
		return ValidatedInstance(instanceURL: instanceURL, discovery: discovery, validation: validation)
	}

	func login(instanceURL: URL, apiBase: String, email: String, password: String) async throws -> AuthResponse {
		try await send(
			instanceURL: instanceURL,
			apiBase: apiBase,
			endpoint: "auth/login",
			method: "POST",
			token: nil,
			body: LoginRequest(email: email, password: password)
		)
	}

	func me(instanceURL: URL, apiBase: String, token: String) async throws -> MeResponse {
		try await send(
			instanceURL: instanceURL,
			apiBase: apiBase,
			endpoint: "me",
			method: "GET",
			token: token,
			body: Optional<EmptyBody>.none
		)
	}

	func logout(instanceURL: URL, apiBase: String, token: String) async throws {
		try await sendVoid(
			instanceURL: instanceURL,
			apiBase: apiBase,
			endpoint: "auth/logout",
			method: "POST",
			token: token
		)
	}

	func stacks(instanceURL: URL, apiBase: String, token: String) async throws -> [StackSummary] {
		let response: StacksResponse = try await send(
			instanceURL: instanceURL,
			apiBase: apiBase,
			endpoint: "stacks",
			method: "GET",
			token: token,
			body: Optional<EmptyBody>.none
		)
		return response.stacks
	}

	func stack(instanceURL: URL, apiBase: String, token: String, stackID: String) async throws -> StackDetail {
		try await send(
			instanceURL: instanceURL,
			apiBase: apiBase,
			endpoint: "stacks/\(stackID)",
			method: "GET",
			token: token,
			body: Optional<EmptyBody>.none
		)
	}

	func documents(instanceURL: URL, apiBase: String, token: String, stackID: String) async throws -> [DocumentSummary] {
		let response: DocumentsResponse = try await send(
			instanceURL: instanceURL,
			apiBase: apiBase,
			endpoint: "stacks/\(stackID)/documents",
			method: "GET",
			token: token,
			body: Optional<EmptyBody>.none
		)
		return response.documents
	}

	func document(instanceURL: URL, apiBase: String, token: String, documentID: String) async throws -> DocumentDetail {
		try await send(
			instanceURL: instanceURL,
			apiBase: apiBase,
			endpoint: "documents/\(documentID)",
			method: "GET",
			token: token,
			body: Optional<EmptyBody>.none
		)
	}

	func annotations(instanceURL: URL, apiBase: String, token: String, documentID: String, versionID: String) async throws -> [AnnotationThread] {
		let response: AnnotationsResponse = try await send(
			instanceURL: instanceURL,
			apiBase: apiBase,
			endpoint: "documents/\(documentID)/versions/\(versionID)/annotations",
			method: "GET",
			token: token,
			body: Optional<EmptyBody>.none
		)
		return response.annotations
	}

	func createAnnotation(instanceURL: URL, apiBase: String, token: String, request: CreateAnnotationRequest) async throws -> Annotation {
		let response: AnnotationResponse = try await send(
			instanceURL: instanceURL,
			apiBase: apiBase,
			endpoint: "annotations",
			method: "POST",
			token: token,
			body: request
		)
		return response.annotation
	}

	func createAnnotationComment(instanceURL: URL, apiBase: String, token: String, annotationID: String, body: String) async throws -> AnnotationComment {
		let response: AnnotationCommentResponse = try await send(
			instanceURL: instanceURL,
			apiBase: apiBase,
			endpoint: "annotations/\(annotationID)/comments",
			method: "POST",
			token: token,
			body: CreateAnnotationCommentRequest(body: body)
		)
		return response.comment
	}

	private func send<Response: Decodable, Body: Encodable>(
		instanceURL: URL,
		apiBase: String,
		endpoint: String,
		method: String,
		token: String?,
		body: Body?
	) async throws -> Response {
		var request = URLRequest(url: makeURL(instanceURL: instanceURL, apiBase: apiBase, endpoint: endpoint))
		request.httpMethod = method
		request.setValue("application/json", forHTTPHeaderField: "Accept")
		if let token {
			request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
		}
		if let body {
			request.httpBody = try encoder.encode(body)
			request.setValue("application/json", forHTTPHeaderField: "Content-Type")
		}

		let (data, response) = try await urlSession.data(for: request)
		guard let httpResponse = response as? HTTPURLResponse else {
			throw APIClientError.invalidResponse
		}
		guard 200..<300 ~= httpResponse.statusCode else {
			throw decodeError(from: data, statusCode: httpResponse.statusCode)
		}
		return try decoder.decode(Response.self, from: data)
	}

	private func sendVoid(
		instanceURL: URL,
		apiBase: String,
		endpoint: String,
		method: String,
		token: String?
	) async throws {
		var request = URLRequest(url: makeURL(instanceURL: instanceURL, apiBase: apiBase, endpoint: endpoint))
		request.httpMethod = method
		request.setValue("application/json", forHTTPHeaderField: "Accept")
		if let token {
			request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
		}

		let (data, response) = try await urlSession.data(for: request)
		guard let httpResponse = response as? HTTPURLResponse else {
			throw APIClientError.invalidResponse
		}
		guard 200..<300 ~= httpResponse.statusCode else {
			throw decodeError(from: data, statusCode: httpResponse.statusCode)
		}
	}

	private func decodeError(from data: Data, statusCode: Int) -> APIClientError {
		if let envelope = try? decoder.decode(APIErrorEnvelope.self, from: data) {
			return .server(statusCode: statusCode, message: envelope.error.message)
		}
		return .server(statusCode: statusCode, message: "The server returned HTTP \(statusCode).")
	}
}

func makeURL(instanceURL: URL, apiBase: String, endpoint: String) -> URL {
	var components = URLComponents(url: instanceURL, resolvingAgainstBaseURL: false) ?? URLComponents()
	let parts = [components.path, apiBase, endpoint]
		.map { $0.trimmingCharacters(in: CharacterSet(charactersIn: "/")) }
		.filter { !$0.isEmpty }
	components.path = "/" + parts.joined(separator: "/")
	components.query = nil
	return components.url ?? instanceURL
}

enum APIClientError: Error, Equatable {
	case invalidResponse
	case invalidInstance
	case server(statusCode: Int, message: String)
}

extension APIClientError: LocalizedError {
	var errorDescription: String? {
		switch self {
		case .invalidResponse:
			"Downwrite returned a response this app could not read."
		case .invalidInstance:
			"That URL does not look like a Downwrite instance."
		case let .server(_, message):
			message
		}
	}
}

struct ValidatedInstance: Equatable {
	var instanceURL: URL
	var discovery: DiscoveryResponse
	var validation: InstanceValidationResponse
}

extension JSONDecoder {
	static var downwrite: JSONDecoder {
		let decoder = JSONDecoder()
		decoder.dateDecodingStrategy = .custom { decoder in
			let container = try decoder.singleValueContainer()
			let value = try container.decode(String.self)
			if let date = makeISO8601Formatter(formatOptions: [.withInternetDateTime, .withFractionalSeconds]).date(from: value) {
				return date
			}
			if let date = makeISO8601Formatter(formatOptions: [.withInternetDateTime]).date(from: value) {
				return date
			}
			throw DecodingError.dataCorruptedError(in: container, debugDescription: "Invalid ISO8601 date: \(value)")
		}
		return decoder
	}
}

extension JSONEncoder {
	static var downwrite: JSONEncoder {
		let encoder = JSONEncoder()
		encoder.dateEncodingStrategy = .iso8601
		return encoder
	}
}

func makeISO8601Formatter(formatOptions: ISO8601DateFormatter.Options) -> ISO8601DateFormatter {
	let formatter = ISO8601DateFormatter()
	formatter.formatOptions = formatOptions
	return formatter
}

struct EmptyBody: Encodable {}

struct LoginRequest: Encodable {
	var email: String
	var password: String
}

struct StacksResponse: Decodable {
	var stacks: [StackSummary]
}

struct DocumentsResponse: Decodable {
	var documents: [DocumentSummary]
}

struct AnnotationsResponse: Decodable {
	var annotations: [AnnotationThread]
}

struct AnnotationResponse: Decodable {
	var annotation: Annotation
}

struct AnnotationCommentResponse: Decodable {
	var comment: AnnotationComment
}

struct APIErrorEnvelope: Decodable {
	var error: APIErrorBody
}

struct APIErrorBody: Decodable {
	var code: String
	var message: String
}

struct CreateAnnotationRequest: Encodable {
	var documentID: String
	var documentVersionID: String
	var quote: String
	var comment: String
	var startOffset: Int
	var endOffset: Int
	var prefix: String
	var suffix: String

	enum CodingKeys: String, CodingKey {
		case documentID = "document_id"
		case documentVersionID = "document_version_id"
		case quote
		case comment
		case startOffset = "start_offset"
		case endOffset = "end_offset"
		case prefix
		case suffix
	}
}

struct CreateAnnotationCommentRequest: Encodable {
	var body: String
}
