import { hasMeaningfulSearch } from './pgSearch'

export const MIN_SEARCH_CHARS = 2

export function isValidSearchQuery(query) {
  return hasMeaningfulSearch(query)
}

export function getSearchValidationMessage() {
  return 'Type at least 2 characters, or choose a suggestion from the list.'
}
