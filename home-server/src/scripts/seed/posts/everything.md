This post holds every kind of content a post can hold, so it is the one to open when checking that nothing has regressed. The picture above the text is the header image; everything below it is Markdown.

## Text

Paragraphs can mix **bold**, _italic_, **_both at once_**, ~~struck through~~ text, and `inline code`. Links can stay on the site, like the [blog index](/blog), leave it, like [example.com](https://example.com), or start an email, like [a mailto link](mailto:hello@example.com). A bare address such as https://example.com/bare is linked on its own.

A line can be broken by hand\
with a trailing backslash, and characters such as \* and \_ can be escaped.

## Images

![A diagram of boxes and arrows](./images/layout-diagram.png "Images can carry a title")

Images sit in the flow of the text and open at full size when clicked. They can be photographs:

![A harbour at first light](./images/harbour.webp)

They can use newer formats such as AVIF:

![Lichen on a rock](./images/lichen.avif)

And they can move:

![The sun crossing the sky in a short loop](./images/sun-loop.gif)

An image can also be a link. Clicking this one follows the link to example.com instead of opening the picture at full size:

[![A banner that links to example.com](./images/linked-banner.png)](https://example.com)

Emphasis around a linked image changes nothing, so this one follows its link too:

[**![A second banner, wrapped in bold](./images/linked-banner.png)**](/blog)

## Lists

- An unordered item
- Another unordered item
  - A nested item
    - And one nested deeper

1. An ordered item
2. A second ordered item
   - With an unordered item inside

- [x] A finished task
- [ ] An unfinished task

## Quotes

> A block quotation, for when someone else said it better.
>
> > And a quotation inside the quotation.

## Code

```ts
const greet = (name: string) => `Hello, ${name}.`;
```

## Tables

| Element    | Supported |                  Notes |
| ---------- | :-------: | ---------------------: |
| Tables     |    yes    |    right aligned notes |
| Task lists |    yes    | rendered as checkboxes |
| Images     |    yes    |   five formats, moving |

---

A closing paragraph after a horizontal rule.
