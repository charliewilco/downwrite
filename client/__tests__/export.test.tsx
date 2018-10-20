import Export from "../components/export";
import { render } from "react-testing-library";

const { container } = render(<Export />);

describe("<Export />", () => {
  it("renders", () => {
    expect(container).toBeTruthy();
  });
});
