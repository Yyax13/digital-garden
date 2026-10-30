
import { h } from "preact"
import * as ExternalPlugin from "./.quartz/plugins"
import {
  loadQuartzConfig,
  loadQuartzLayout,
} from "./quartz/plugins/loader/config-loader"
import { existsSync, readFileSync } from "node:fs"
import { resolve } from "node:path"

// -----------------------------------------------------------------------------
// Custom OG Images
// The plugin is registered before loadQuartzConfig()
// -----------------------------------------------------------------------------

ExternalPlugin.CustomOgImages({
  colorScheme: "darkMode",
  width: 1200,
  height: 630,
  excludeRoot: false,

  // IMPORTANT: the plugin passes ONE options object.
  imageStructure: ({
    cfg,
    fileData,
    title,
    fonts,
  }: any) => {
    // -------------------------------------------------------------------------
    // Metadata
    // -------------------------------------------------------------------------

    const fm = fileData?.frontmatter ?? {}
    const dates = fileData?.dates ?? {}

    const rawAuthor = fm.author ?? fm.authors

    const author = Array.isArray(rawAuthor)
      ? rawAuthor.join(", ")
      : typeof rawAuthor === "string"
        ? rawAuthor
        : "h0wos3c"

    const rawDate =
      dates.published ??
      dates.created ??
      fm.published ??
      fm.publishDate ??
      fm.date

    const parsedDate = rawDate
      ? rawDate instanceof Date
        ? rawDate
        : new Date(rawDate)
      : null

    const published =
      parsedDate && !isNaN(parsedDate.getTime())
        ? new Intl.DateTimeFormat(cfg.locale ?? "en-US", {
            year: "numeric",
            month: "short",
            day: "2-digit",
          }).format(parsedDate)
        : "Unknown date"

    // -------------------------------------------------------------------------
    // Unfinished status
    // -------------------------------------------------------------------------

    const tags: string[] = Array.isArray(fm.tags)
      ? fm.tags.map(String)
      : typeof fm.tags === "string"
        ? [fm.tags]
        : []

    const unfinished = tags.some(
      (tag) =>
        tag.replace(/^#/, "").toLowerCase() === "unfinished",
    )

    // -------------------------------------------------------------------------
// Table of Contents: H1 only
// Read original Markdown through fileData.filePath
// -------------------------------------------------------------------------

function getOriginalMarkdown(fileData: any): string {
  const candidates = [
    fileData.filePath
      ? resolve(fileData.filePath)
      : undefined,

    fileData.filePath
      ? resolve("content", fileData.filePath)
      : undefined,

    fileData.slug
      ? resolve("content", `${fileData.slug}.md`)
      : undefined,
  ]

  for (const file of candidates) {
    if (file && existsSync(file)) {
      return readFileSync(file, "utf8")
    }
  }

  return ""
}

const markdown = getOriginalMarkdown(fileData)
const headings: string[] = []

let insideCodeBlock = false
let fenceChar = ""
let fenceLength = 0

const lines = markdown.split(/\r?\n/)

for (let i = 0; i < lines.length; i++) {
  const line = lines[i]

  // Ignore YAML frontmatter
  if (i === 0 && line.trim() === "---") {
    while (++i < lines.length && lines[i].trim() !== "---") {}
    continue
  }

  // Ignore fenced code blocks
  const fence = line.match(/^\s*(`{3,}|~{3,})/)

  if (fence) {
    const marker = fence[1]

    if (!insideCodeBlock) {
      insideCodeBlock = true
      fenceChar = marker[0]
      fenceLength = marker.length
    } else if (
      marker[0] === fenceChar &&
      marker.length >= fenceLength
    ) {
      insideCodeBlock = false
    }

    continue
  }

  if (insideCodeBlock) continue

  // ATX H1: # Heading
  const atx = line.match(/^#\s+(.+?)\s*#*\s*$/)

  if (atx) {
    headings.push(atx[1])
    continue
  }

  // Setext H1:
  // Heading
  // =======
  if (
    line.trim() &&
    i + 1 < lines.length &&
    /^=+\s*$/.test(lines[i + 1])
  ) {
    headings.push(line.trim())
    i++
  }
}

// Clean Markdown formatting from heading labels
const tocHeadings = headings.map((heading) =>
  heading
    .replace(/\s*\{#[^}]+\}\s*$/, "")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\[\[([^|\]]+)\|([^\]]+)\]\]/g, "$2")
    .replace(/\[\[([^\]]+)\]\]/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .trim(),
)

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
    // Author initials
    // -------------------------------------------------------------------------

    const initials = author
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((word: string) => word[0].toUpperCase())
      .join("")

    // -------------------------------------------------------------------------
    // Reusable components
    // Preact h() returns the VNodes consumed by Satori.
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
    // Image structure
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

          // Publication date and status

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
            display: "-webkit-box",
            WebkitBoxOrient: "vertical",
            WebkitLineClamp: 5,
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

          ...tocHeadings.slice(0, 15).map(
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

                text(String(index + 1).padStart(2, "0"), {
                  color: colors.accent,
                  fontSize: 13,
                  fontWeight: 700,
                  flexShrink: 0,
                }),

                text(heading, {
                  fontSize: 15,
                  color: colors.secondary,
                  lineHeight: 1.4,
                  display: "-webkit-box",
                  WebkitBoxOrient: "vertical",
                  WebkitLineClamp: 2,
                  overflow: "hidden",
                }),
              ),
          ),
        ),

        ...(tocHeadings.length === 0
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
