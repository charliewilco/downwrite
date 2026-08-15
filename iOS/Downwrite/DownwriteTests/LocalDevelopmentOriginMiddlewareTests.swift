import Foundation
import HTTPTypes
import OpenAPIRuntime
import Testing

@testable import Downwrite

struct LocalDevelopmentOriginMiddlewareTests {
    @Test func addsOriginToUnsafeSessionWrite() async throws {
        let origin = "http://localhost:4321"
        let middleware = LocalDevelopmentOriginMiddleware(origin: origin)
        let request = HTTPRequest(
            method: .post,
            scheme: "http",
            authority: "localhost:4321",
            path: "/api/v1/groups"
        )

        _ = try await middleware.intercept(
            request,
            body: nil,
            baseURL: URL(string: origin)!,
            operationID: "createGroup"
        ) { request, _, _ in
            #expect(request.headerFields[.origin] == origin)
            return (HTTPResponse(status: .created), nil)
        }
    }

    @Test func leavesSafeRequestWithoutOrigin() async throws {
        let origin = "http://localhost:4321"
        let middleware = LocalDevelopmentOriginMiddleware(origin: origin)
        let request = HTTPRequest(
            method: .get,
            scheme: "http",
            authority: "localhost:4321",
            path: "/api/v1/groups"
        )

        _ = try await middleware.intercept(
            request,
            body: nil,
            baseURL: URL(string: origin)!,
            operationID: "listGroups"
        ) { request, _, _ in
            #expect(request.headerFields[.origin] == nil)
            return (HTTPResponse(status: .ok), nil)
        }
    }
}
