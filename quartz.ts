
import { h } from "preact"
import * as ExternalPlugin from "./.quartz/plugins"
import {
  loadQuartzConfig,
  loadQuartzLayout,
} from "./quartz/plugins/loader/config-loader"

// -----------------------------------------------------------------------------
// Custom OG Images
// -----------------------------------------------------------------------------

ExternalPlugin.CustomOgImages({
  colorScheme: "darkMode",
  width: 1200,
  height: 630,
  excludeRoot: false,

  imageStructure: ({
    cfg,
    fileData,
    title,
    fonts,
    iconBase64,
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
    // Description and tags
    // -------------------------------------------------------------------------

    const description =
      fileData?.description ??
      fm.description ??
      ""

    const tags: string[] = Array.isArray(fm.tags)
      ? fm.tags.map(String)
      : typeof fm.tags === "string"
        ? [fm.tags]
        : []

    const unfinished = tags.some(
      (tag) =>
        tag.replace(/^#/, "").toLowerCase() === "unfinished",
    )

    const categories = [
      ...new Set(
        tags
          .filter(
            (tag) => tag.replace(/^#/, "").toLowerCase() !== "unfinished",
          )
          .map((tag) => tag.replace(/^#/, "")),
      ),
    ]

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
    // Author initials (fallback for missing favicon)
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

          // Real favicon

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
              },
            },

            iconBase64
              ? h("img", {
                  src: iconBase64,
                  width: 76,
                  height: 76,
                  style: {
                    objectFit: "contain",
                  },
                })
              : h(
                  "div",
                  {
                    style: {
                      display: "flex",
                      color: colors.accent,
                      fontFamily: headerFont,
                      fontSize: 48,
                      fontWeight: 700,
                    },
                  },
                  initials || "?",
                ),
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
              fontSize: 36,
              fontWeight: 700,
              marginTop: 10,
              lineClamp: 2,
            }),

            text("PERSONAL KNOWLEDGE BASE", {
              color: colors.muted,
              fontSize: 10,
              fontWeight: 600,
              letterSpacing: 1.5,
              marginTop: 8,
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
              padding: 36,
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
            fontSize: title.length > 45 ? 54 : 72,
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
      // RIGHT COLUMN: DESCRIPTION AND TOPICS
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
            gap: 18,
            overflow: "hidden",
          },
        },

        text("ABOUT THIS NOTE", {
          fontFamily: headerFont,
          fontSize: 20,
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
          },
        }),

        // Description

        text("DESCRIPTION", {
          color: colors.muted,
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: 1.5,
        }),

        text(
          description || "A note from the personal knowledge base.",
          {
            color: colors.secondary,
            fontSize: 17,
            lineHeight: 1.5,
            overflow: "hidden",
            display: "-webkit-box",
            WebkitBoxOrient: "vertical",
            WebkitLineClamp: 7,
          },
        ),

        // Topics

        text("TOPICS", {
          color: colors.muted,
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: 1.5,
          marginTop: 8,
        }),

        h(
          "div",
          {
            style: {
              display: "flex",
              flexDirection: "row",
              flexWrap: "wrap",
              gap: 8,
            },
          },

          ...categories.slice(0, 8).map((tag: string) =>
            h(
              "div",
              {
                key: tag,
                style: {
                  display: "flex",
                  padding: "7px 10px",
                  borderRadius: 6,
                  backgroundColor: colors.surfaceAlt,
                  border: `1px solid ${colors.border}`,
                  color: colors.secondary,
                  fontSize: 13,
                },
              },
              `#${tag}`,
            ),
          ),
        ),
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
