import { Kbd, KbdGroup } from '@/components/ui/kbd';
import { SidebarTrigger } from '@/components/ui/sidebar';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip';

type CustomSidebarTriggerProps = {
    testId?: string;
};

export function CustomSidebarTrigger({
    testId = 'app-shell-mobile-menu-trigger',
}: CustomSidebarTriggerProps): React.ReactElement {
    return (
        <Tooltip delayDuration={1000}>
            <TooltipTrigger asChild>
                <SidebarTrigger
                    className="size-9 shrink-0 border-2 border-[var(--neutral-900)] bg-card shadow-[2px_2px_0_0_var(--neutral-900)] hover:bg-[var(--brand-primary-soft)] hover:text-[var(--brand-primary-active)] [&_svg]:size-4 [&_svg]:stroke-[2.5]"
                    data-testid={testId}
                    variant="outline"
                />
            </TooltipTrigger>
            <TooltipContent className="px-2 py-1" side="right">
                Toggle Sidebar{' '}
                <KbdGroup>
                    <Kbd>⌘</Kbd>
                    <Kbd>b</Kbd>
                </KbdGroup>
            </TooltipContent>
        </Tooltip>
    );
}
