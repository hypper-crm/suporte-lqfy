// Row types mirroring the Supabase schema.

export type Board = 'support' | 'implementation'

// Support cards only.
export type CardPriority = 'low' | 'medium' | 'high' | 'urgent'

// Support cards only.
export type CardRequestType = 'question' | 'bug' | 'request' | 'other'

export type Profile = {
  id: string
  full_name: string | null
  avatar_url: string | null
  created_at: string
}

export type Client = {
  id: string
  name: string
  email: string | null
  niche: string | null
  pay_in_rate: number | null
  pay_out_rate: number | null
  website: string | null
  cover_image_url: string | null
  created_at: string
  updated_at: string
}

export type BoardColumn = {
  id: string
  board: Board
  name: string
  position: number
}

export type Card = {
  id: string
  board: Board
  column_id: string
  title: string
  description: string | null
  client_id: string | null
  start_date: string | null
  position: number
  priority: CardPriority | null
  request_type: CardRequestType | null
  created_by: string | null
  created_at: string
  updated_at: string
}

// Team members assigned to a card. A card can have many assignees.
export type CardAssignee = {
  card_id: string
  profile_id: string
}

export type CardAttachment = {
  id: string
  card_id: string
  storage_path: string
  file_name: string
  mime_type: string | null
  file_size: number | null
  uploaded_by: string | null
  created_at: string
}

// Default steps copied into the checklist of every new implementation card.
export type ImplementationStepTemplate = {
  id: string
  title: string
  position: number
}

export type CardTask = {
  id: string
  card_id: string
  title: string
  position: number
  is_done: boolean
  completed_at: string | null
  completed_by: string | null
}
