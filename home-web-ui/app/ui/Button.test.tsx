import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import Button from "@/app/ui/Button";

describe("Button", () => {
  it("renders its label", () => {
    render(<Button type="button">Save</Button>);

    expect(screen.getByRole("button", { name: "Save" })).toBeInTheDocument();
  });
});
