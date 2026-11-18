import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { CustomSection } from './CustomSectionEditor';

export default function CustomHtmlCodeEditor({ section, onUpdate }: {
  section: CustomSection;
  onUpdate: (updates: Partial<CustomSection>) => void;
}) {
  return <div className="space-y-3">
    <div>
      <Label htmlFor={`${section.id}-name`}>সেকশনের নাম</Label>
      <Input id={`${section.id}-name`} value={section.name ?? ''}
        onChange={event => onUpdate({ name: event.target.value })} />
    </div>
    <div>
      <Label htmlFor={`${section.id}-html-code`}>সম্পূর্ণ HTML ও CSS কোড</Label>
      <Textarea id={`${section.id}-html-code`} value={section.content}
        onChange={event => onUpdate({ content: event.target.value })}
        spellCheck={false} className="min-h-[360px] font-mono text-xs" />
    </div>
  </div>;
}