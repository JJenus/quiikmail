// @ts-check
import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt(
  {
    rules: {
      // Email bodies are sanitized via DOMPurify (app/utils/mailHtml.ts) before v-html.
      'vue/no-v-html': 'off'
    }
  }
)
