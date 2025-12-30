import { SupabaseClient, PostgrestError } from '@supabase/supabase-js'

type Result = {
  success: boolean
  message: string
  data?: any
  error?: PostgrestError | Error | null
}

function explainPostgrestError(err: PostgrestError | null | undefined) {
  if (!err) return 'No PostgREST error object.'
  const parts: string[] = []
  if (err.code) parts.push(`code=${err.code}`)
  if (err.message) parts.push(`message=${err.message}`)
  if (err.details) parts.push(`details=${err.details}`)
  if (err.hint) parts.push(`hint=${err.hint}`)
  return parts.join(' | ')
}

async function genericInsertWithDiagnostics(
  supabase: SupabaseClient,
  table: string,
  identifyingWhere: Record<string, any>,
  payload: Record<string, any>
): Promise<Result> {
  try {
    // Check whether a row already exists (helps explain unique constraint / idempotence)
    const selectQuery = supabase.from(table).select('id, created_at, completed_at').limit(1)
    Object.entries(identifyingWhere).forEach(([k, v]) => selectQuery.eq(k, v))
    const { data: existing, error: selectError } = await selectQuery

    if (selectError) {
      console.error(`[${table}] SELECT error while checking existing row:`, selectError)
      // If RLS disallows select, this is a strong hint the insert will also be blocked.
      const explanation = explainPostgrestError(selectError as PostgrestError)
      return {
        success: false,
        message: `SELECT failed for ${table}. Possible RLS/policy or permission error: ${explanation}`,
        error: selectError
      }
    }

    if (existing && (existing as any).length > 0) {
      // Row already exists for identifyingWhere (silent)
      return {
        success: true,
        message: `Row already exists in ${table}`,
        data: existing[0]
      }
    }

    // Attempt insert
    const { data, error } = await supabase.from(table).insert(payload).select()

    if (error) {
      console.error(`[${table}] INSERT error:`, error)
      const explanation = explainPostgrestError(error as PostgrestError)

      // After an error, re-check whether the row exists (sometimes insert succeeded but response suppressed)
      const recheckQuery = supabase.from(table).select('id, created_at, completed_at')
      Object.entries(identifyingWhere).forEach(([k, v]) => recheckQuery.eq(k, v))
      const { data: recheckData, error: recheckErr } = await recheckQuery
      if (!recheckErr && recheckData && (recheckData as any).length > 0) {
        // Insert reported error but row now exists (silent)
        return {
          success: true,
          message: `Insert reported an error but row exists in ${table}. Insert may have succeeded. ${explanation}`,
          data: recheckData[0]
        }
      }

      // Interpret common situations
      let reason = explanation
      if ((error as any).code === '23505' || (error as any).message?.toLowerCase?.().includes('unique')) {
        reason = `Unique constraint violation (row already exists): ${explanation}`
      }
      if ((error as any).message?.toLowerCase?.().includes('permission') || (error as any).message?.toLowerCase?.includes('policy')) {
        reason = `Permission/RLS policy denied the operation: ${explanation}`
      }

      return {
        success: false,
        message: `INSERT failed for ${table}: ${reason}`,
        error
      }
    }

    // Success path (silent)
    return {
      success: true,
      message: `Inserted into ${table}`,
      data
    }
  } catch (err) {
    // Network or unexpected error
    console.error(`[${table}] Unexpected error during insert diagnostics:`, err)
    return {
      success: false,
      message: `Unexpected error when inserting into ${table}: ${(err as Error).message}`,
      error: err as Error
    }
  }
}

/**
 * Debug helper for inserting a lesson completion and explaining failures.
 * @returns {Promise<Result>} - success flag and explanatory message/details
 */
export async function debugInsertLessonCompletion(
  supabase: SupabaseClient,
  user_id: string,
  module_id: string,
  lesson_id: string,
  lesson_title: string
): Promise<Result> {
  const table = 'lesson_completions'
  const identifyingWhere = { user_id, module_id, lesson_id }
  const payload = { user_id, module_id, lesson_id, lesson_title }
  return genericInsertWithDiagnostics(supabase, table, identifyingWhere, payload)
}

/**
 * Pattern for exercise completions. Provide the minimal required fields.
 * Extend the `payload` with other fields (submitted_code, is_correct, attempts) as needed.
 */
export async function debugInsertExerciseCompletion(
  supabase: SupabaseClient,
  user_id: string,
  module_id: string,
  exercise_id: string,
  exercise_title: string,
  submitted_code = ''
): Promise<Result> {
  const table = 'exercise_completions'
  const identifyingWhere = { user_id, module_id, exercise_id }
  const payload = { user_id, module_id, exercise_id, exercise_title, submitted_code }
  return genericInsertWithDiagnostics(supabase, table, identifyingWhere, payload)
}

/**
 * Pattern for project completions. Provide required fields; add `validation_results` etc. if available.
 */
export async function debugInsertProjectCompletion(
  supabase: SupabaseClient,
  user_id: string,
  module_id: string,
  project_id: string,
  project_title: string,
  submitted_code = ''
): Promise<Result> {
  const table = 'project_completions'
  const identifyingWhere = { user_id, module_id, project_id }
  const payload = { user_id, module_id, project_id, project_title, submitted_code }
  return genericInsertWithDiagnostics(supabase, table, identifyingWhere, payload)
}

export default {
  debugInsertLessonCompletion,
  debugInsertExerciseCompletion,
  debugInsertProjectCompletion
}
