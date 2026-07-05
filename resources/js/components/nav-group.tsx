import { Link } from '@inertiajs/react';
import { ChevronRightIcon } from 'lucide-react';
import type { ReactNode } from 'react';

import type { SidebarNavGroup } from '@/components/app-shared';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
} from '@/components/ui/sidebar';

export function NavGroup({ label, items }: SidebarNavGroup): ReactNode {
    return (
        <SidebarGroup>
            {label ? <SidebarGroupLabel>{label}</SidebarGroupLabel> : null}
            <SidebarMenu>
                {items.map((item) => (
                    <Collapsible
                        asChild
                        className="group/collapsible"
                        defaultOpen={
                            !!item.isActive ||
                            item.subItems?.some((subItem) => !!subItem.isActive)
                        }
                        key={item.title}
                    >
                        <SidebarMenuItem>
                            {item.subItems?.length ? (
                                <>
                                    <CollapsibleTrigger asChild>
                                        <SidebarMenuButton isActive={item.isActive}>
                                            {item.icon}
                                            <span>{item.title}</span>
                                            <ChevronRightIcon className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                                        </SidebarMenuButton>
                                    </CollapsibleTrigger>
                                    <CollapsibleContent>
                                        <SidebarMenuSub>
                                            {item.subItems.map((subItem) => (
                                                <SidebarMenuSubItem key={subItem.title}>
                                                    <SidebarMenuSubButton
                                                        asChild
                                                        isActive={subItem.isActive}
                                                    >
                                                        <Link
                                                            href={subItem.path ?? '#'}
                                                            prefetch
                                                        >
                                                            {subItem.icon}
                                                            <span>{subItem.title}</span>
                                                        </Link>
                                                    </SidebarMenuSubButton>
                                                </SidebarMenuSubItem>
                                            ))}
                                        </SidebarMenuSub>
                                    </CollapsibleContent>
                                </>
                            ) : (
                                <SidebarMenuButton asChild isActive={item.isActive}>
                                    <Link href={item.path ?? '#'} prefetch>
                                        {item.icon}
                                        <span>{item.title}</span>
                                    </Link>
                                </SidebarMenuButton>
                            )}
                        </SidebarMenuItem>
                    </Collapsible>
                ))}
            </SidebarMenu>
        </SidebarGroup>
    );
}
