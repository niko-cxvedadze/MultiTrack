'use client'

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'

type FaqItem = {
  id: string
  question: string
  answer: string
}

type FaqAccordionProps = {
  items: FaqItem[]
}

export function FaqAccordion({ items }: FaqAccordionProps) {
  return (
    <Accordion type="multiple">
      {items.map((item) => (
        <AccordionItem key={item.id} value={item.id}>
          <AccordionTrigger>{item.question}</AccordionTrigger>
          <AccordionContent className="h-auto">
            <p className="text-foreground/80">{item.answer}</p>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  )
}
