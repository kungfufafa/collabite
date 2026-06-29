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
                <SidebarTrigger data-testid={testId} />
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
