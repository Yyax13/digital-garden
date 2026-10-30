
import * as ExternalPlugin from "./.quartz/plugins"
import { loadQuartzConfig, loadQuartzLayout } from "./quartz/plugins/loader/config-loader"

// -----------------------------------------------------------------------------
// Custom Open Graph image
// Must be registered BEFORE loadQuartzConfig()
// -----------------------------------------------------------------------------

// Satori-compatible element factory (no React dependency)
const h = (
  type: string,
  props: Record<string, any> | null,
  ...children: any[]
) => ({
  type,
  props: {
    ...(props ?? {}),
    ...(children.length > 0
      ? {
          children:
            children.length === 1
              ? children[0]
              : children,
        }
      : {}),
  },
})

ExternalPlugin.CustomOgImages({
  colorScheme: "darkMode",
  width: 1200,
  height: 630,
  excludeRoot: false,

  imageStructure: (
    cfg: any,
    userOpts: any,
    title: string,
    _description: string,
    fonts: any,
    fileData: any,
  ) => {
    const fm = fileData.frontmatter ?? {}
    const dates = fileData.dates ?? {}

    // -------------------------------------------------------------------------
    // Metadata
    // -------------------------------------------------------------------------

    const rawAuthor = fm.author

    const author = Array.isArray(rawAuthor)
      ? rawAuthor.join(", ")
      : typeof rawAuthor === "string"
        ? rawAuthor
        : "Unknown author"

    const rawDate =
      dates.published ??
      dates.created ??
      fm.published ??
      fm.publishDate ??
      fm.date

    const date = rawDate ? new Date(rawDate) : null

    const published =
      date && !isNaN(date.getTime())
        ? new Intl.DateTimeFormat(cfg.locale ?? "en-US", {
            year: "numeric",
            month: "short",
            day: "2-digit",
          }).format(date)
        : "Unknown date"

    // -------------------------------------------------------------------------
    // Unfinished tag
    // -------------------------------------------------------------------------

    const rawTags = [
      ...(Array.isArray(fm.tags) ? fm.tags : []),
      ...(Array.isArray(fileData.tags) ? fileData.tags : []),
    ]

    const unfinished = rawTags.some(
      (tag: string) =>
        String(tag).replace(/^#/, "").toLowerCase() === "unfinished",
    )

    // -------------------------------------------------------------------------
    // Table of Contents: H1 only
    // -------------------------------------------------------------------------

    const markdown = String(fileData.text ?? "")
    const headings: string[] = []

    let insideCodeBlock = false

    for (const line of markdown.split("\n")) {
      if (/^\s*(```|~~~)/.test(line)) {
        insideCodeBlock = !insideCodeBlock
        continue
      }

      if (insideCodeBlock) continue

      const match = line.match(/^#\s+(.+?)\s*#*\s*$/)

      if (match) {
        headings.push(
          match[1]
            .replace(/\s*\{#[^}]+\}\s*$/, "")
            .trim(),
        )
      }
    }

    // -------------------------------------------------------------------------
    // Colors
    // -------------------------------------------------------------------------

    const colors = {
      background: "#0b0b0e",
      surface: "#131318",
      surfaceAlt: "#19191f",
      border: "#292930",

      primary: "#e8e8ed",
      secondary: "#9999a5",
      muted: "#686875",

      accent: "#b44b55",
      warning: "#e6a44b",
      success: "#75b99b",
    }

    const headerFont = fonts[0].name
    const bodyFont = fonts[1].name

    // -------------------------------------------------------------------------
    // Author monogram
    // -------------------------------------------------------------------------

    const initials = author
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((word: string) => word[0].toUpperCase())
      .join("")

    // -------------------------------------------------------------------------
    // Reusable components
    // -------------------------------------------------------------------------

    const text = (
      value: string,
      style: Record<string, any> = {},
    ) =>
      h(
        "div",
        {
          style: {
            display: "flex",
            color: colors.primary,
            fontFamily: bodyFont,
            ...style,
          },
        },
        value,
      )

    const panel = (
      children: any[],
      extraStyle: Record<string, any> = {},
    ) =>
      h(
        "div",
        {
          style: {
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            backgroundColor: colors.surface,
            border: `1px solid ${colors.border}`,
            borderRadius: 12,
            padding: "14px 18px",
            ...extraStyle,
          },
        },
        ...children,
      )

    // -------------------------------------------------------------------------
    // OG image
    // -------------------------------------------------------------------------

    return h(
      "div",
      {
        style: {
          display: "flex",
          flexDirection: "row",
          width: "100%",
          height: "100%",
          padding: 36,
          gap: 24,
          backgroundColor: colors.background,
          fontFamily: bodyFont,
          color: colors.primary,
        },
      },

      // =======================================================================
      // LEFT COLUMN
      // =======================================================================

      h(
        "div",
        {
          style: {
            display: "flex",
            flexDirection: "column",
            width: 800,
            height: "100%",
            gap: 20,
          },
        },

        // ---------------------------------------------------------------------
        // HEADER
        // ---------------------------------------------------------------------

        h(
          "div",
          {
            style: {
              display: "flex",
              flexDirection: "row",
              width: "100%",
              height: 142,
              gap: 14,
            },
          },

          // Author monogram

          h(
            "div",
            {
              style: {
                display: "flex",
                width: 104,
                height: 142,
                flexShrink: 0,
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 12,
                backgroundColor: colors.surfaceAlt,
                border: `1px solid ${colors.border}`,
                color: colors.accent,
                fontFamily: headerFont,
                fontSize: 38,
                fontWeight: 700,
              },
            },
            initials || "?",
          ),

          // Author name

          h(
            "div",
            {
              style: {
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                flex: 1,
                minWidth: 0,
                padding: 12,
              },
            },

            text("WRITTEN BY", {
              color: colors.muted,
              fontSize: 13,
              letterSpacing: 2,
              fontWeight: 700,
            }),

            text(author, {
              fontFamily: headerFont,
              fontSize: 27,
              fontWeight: 700,
              marginTop: 10,
              lineClamp: 2,
            }),
          ),

          // Publication date + unfinished status

          h(
            "div",
            {
              style: {
                display: "flex",
                flexDirection: "column",
                width: 220,
                flexShrink: 0,
                gap: 12,
              },
            },

            // Publication date

            panel(
              [
                text("PUBLISHED", {
                  color: colors.muted,
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: 1.5,
                }),

                text(published, {
                  fontSize: 17,
                  fontWeight: 600,
                  marginTop: 6,
                }),
              ],
              { flex: 1 },
            ),

            // Status

            panel(
              [
                text("STATUS", {
                  color: colors.muted,
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: 1.5,
                }),

                text(unfinished ? "Unfinished" : "Completed", {
                  fontSize: 17,
                  fontWeight: 600,
                  marginTop: 6,
                  color: unfinished
                    ? colors.warning
                    : colors.success,
                }),
              ],
              { flex: 1 },
            ),
          ),
        ),

        // ---------------------------------------------------------------------
        // TITLE
        // ---------------------------------------------------------------------

        h(
          "div",
          {
            style: {
              display: "flex",
              flexDirection: "column",
              flex: 1,
              justifyContent: "center",
              backgroundColor: colors.surface,
              border: `1px solid ${colors.border}`,
              borderRadius: 12,
              padding: 32,
              overflow: "hidden",
            },
          },

          text("NOTE / KNOWLEDGE BASE", {
            color: colors.accent,
            fontSize: 13,
            fontWeight: 700,
            letterSpacing: 2.5,
            marginBottom: 22,
          }),

          text(title, {
            fontFamily: headerFont,
            fontSize: title.length > 45 ? 43 : 58,
            fontWeight: 800,
            lineHeight: 1.15,
            letterSpacing: -1.5,
            lineClamp: 5,
            overflow: "hidden",
          }),
        ),
      ),

      // =======================================================================
      // RIGHT COLUMN: TABLE OF CONTENTS
      // =======================================================================

      h(
        "div",
        {
          style: {
            display: "flex",
            flexDirection: "column",
            width: 304,
            height: "100%",
            backgroundColor: colors.surface,
            border: `1px solid ${colors.border}`,
            borderRadius: 12,
            padding: 22,
            overflow: "hidden",
          },
        },

        // TOC title

        text("CONTENTS", {
          fontFamily: headerFont,
          fontSize: 19,
          fontWeight: 800,
          letterSpacing: 1,
        }),

        // Accent divider

        h("div", {
          style: {
            display: "flex",
            width: "100%",
            height: 3,
            backgroundColor: colors.accent,
            borderRadius: 2,
            marginTop: 14,
            marginBottom: 18,
          },
        }),

        // H1 entries

        h(
          "div",
          {
            style: {
              display: "flex",
              flexDirection: "column",
              gap: 13,
              overflow: "hidden",
            },
          },

          ...headings.slice(0, 15).map(
            (heading: string, index: number) =>
              h(
                "div",
                {
                  key: `${index}-${heading}`,
                  style: {
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "flex-start",
                    gap: 10,
                  },
                },

                text(
                  String(index + 1).padStart(2, "0"),
                  {
                    color: colors.accent,
                    fontSize: 13,
                    fontWeight: 700,
                    flexShrink: 0,
                  },
                ),

                text(heading, {
                  fontSize: 15,
                  color: colors.secondary,
                  lineHeight: 1.4,
                  lineClamp: 2,
                }),
              ),
          ),
        ),

        // Empty TOC fallback

        ...(headings.length === 0
          ? [
              text("No headings available.", {
                color: colors.muted,
                fontSize: 14,
              }),
            ]
          : []),
      ),
    )
  },
})

// -----------------------------------------------------------------------------
// Quartz configuration
// -----------------------------------------------------------------------------

const config = await loadQuartzConfig()

config.configuration.theme.typography = {
  header: {
    name: "Cormorant Garamond",
    includeItalic: false,
  },
  body: {
    name: "Noto Serif",
    includeItalic: false,
  },
  code: "IBM Plex Mono",
}

export default config
export const layout = await loadQuartzLayout()
