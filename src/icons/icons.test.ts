import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import * as icons from "./index";

const { SearchIcon } = icons;

describe("KKDUI icons", () => {
  it("renders a public SVG icon that follows the current text color", () => {
    const wrapper = mount(SearchIcon);
    const svg = wrapper.get("svg");

    expect(svg.attributes("viewBox")).toBe("0 0 20 20");
    expect(svg.attributes("aria-hidden")).toBe("true");
    expect(svg.attributes("fill")).toBe("none");
    expect(svg.attributes("stroke")).toBe("currentColor");
  });

  it("exports the stable public icon collection without internal icons", () => {
    expect(Object.keys(icons).sort()).toEqual([
      "ArrowRightIcon",
      "CheckIcon",
      "ChevronDownIcon",
      "ChevronLeftIcon",
      "ChevronRightIcon",
      "CloseIcon",
      "CopyIcon",
      "EmptyBoxIcon",
      "ErrorCircleIcon",
      "ErrorIcon",
      "InfoIcon",
      "MinusIcon",
      "MoreIcon",
      "RefreshIcon",
      "SearchIcon",
      "SuccessIcon",
      "WarningIcon",
    ]);
  });
});
