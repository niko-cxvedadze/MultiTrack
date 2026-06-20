// ============================================================================
// EVENT TYPES
//
// App events dispatched to the Cloudflare Queue (see apps/backend/src/queue).
// Add your own event types to the EventType enum and the AppEvent union as the
// app grows. The `example` event is a placeholder demonstrating the pattern.
// ============================================================================

export enum EventType {
  Example = 'example',
}

export interface ExampleEvent {
  type: EventType.Example
  message: string
}

// ============================================================================
// APP EVENT UNION
// ============================================================================

export type AppEvent = ExampleEvent
