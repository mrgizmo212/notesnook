/*
This file is part of the Notesnook project (https://notesnook.com/)

Copyright (C) 2023 Streetwriters (Private) Limited

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

import { Button, Flex, FlexProps, Text } from "@theme-ui/components";
import { useStore as useAppStore } from "../../stores/app-store";
import { Menu } from "../../hooks/use-menu";
import useMobile from "../../hooks/use-mobile";
import { PropsWithChildren } from "react";
import { Icon, Shortcut } from "../icons";
import { SchemeColors, createButtonVariant } from "@notesnook/theme";
import { MenuItem } from "@notesnook/ui";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

type NavigationItemProps = {
  icon: Icon;
  color?: SchemeColors;
  title: string;
  isTablet?: boolean;
  isLoading?: boolean;
  isShortcut?: boolean;
  tag?: string;
  selected?: boolean;
  onClick?: () => void;
  count?: number;
  animate?: boolean;
  index?: number;
  menuItems?: MenuItem[];
};

function NavigationItem(
  props: PropsWithChildren<
    NavigationItemProps & { containerRef?: React.Ref<HTMLElement> } & FlexProps
  >
) {
  const {
    icon: Icon,
    color,
    title,
    isLoading,
    isShortcut,
    tag,
    children,
    isTablet,
    selected,
    onClick,
    menuItems,
    count,
    sx,
    containerRef,
    ...restProps
  } = props;
  const toggleSideMenu = useAppStore((store) => store.toggleSideMenu);
  const isMobile = useMobile();

  return (
    <Flex
      {...restProps}
      ref={containerRef}
      sx={{
        ...createButtonVariant(
          selected ? "background-selected" : "transparent",
          "transparent",
          {
            hover: {
              bg: selected ? "hover-selected" : "hover"
            }
          }
        ),
        borderRadius: "default",
        mx: 1,
        p: 0,
        mt: isTablet ? 1 : "3px",
        alignItems: "center",
        position: "relative",
        ":first-of-type": { mt: 1 },
        ":last-of-type": { mb: 1 },
        ...sx
        // ":hover:not(:disabled)": {
        //   bg: "hover",
        //   filter: "brightness(100%)"
        // }
      }}
    >
      <Button
        data-test-id={`navigation-item`}
        sx={{
          px: 2,
          flex: 1,
          alignItems: "center",
          justifyContent: isTablet ? "center" : "flex-start",
          display: "flex"
        }}
        title={title}
        onContextMenu={(e) => {
          if (!menuItems) return;
          e.preventDefault();
          Menu.openMenu(menuItems);
        }}
        onClick={() => {
          if (isMobile) toggleSideMenu(false);
          if (onClick) onClick();
        }}
      >
        <Icon
          size={isTablet ? 16 : 15}
          color={color || (selected ? "icon-selected" : "icon")}
          rotate={isLoading}
        />
        {isShortcut && (
          <Shortcut
            size={8}
            sx={{ position: "absolute", bottom: "8px", left: "6px" }}
            color={color || "icon"}
            data-test-id="shortcut"
          />
        )}

        <Text
          variant="body"
          sx={{
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            fontWeight: selected ? "bold" : "normal",
            color: selected ? "paragraph-selected" : "paragraph",
            fontSize: "subtitle",
            display: isTablet ? "none" : "block"
          }}
          ml={1}
          data-test-id="title"
        >
          {title}
          {/* {tag && (
            <Text
              variant="subBody"
              as="span"
              sx={{
                bg: "accent",
                color: "white",
                ml: 1,
                px: "small",
                borderRadius: "default"
              }}
            >
              {tag}
            </Text>
          )} */}
        </Text>
      </Button>
      {children ? (
        children
      ) : !isTablet && count !== undefined ? (
        <Text
          variant="subBody"
          sx={{ mr: 1, bg: "hover", px: "3px", borderRadius: "default" }}
        >
          {count > 100 ? "100+" : count}
        </Text>
      ) : !isTablet && tag ? (
        <Text
          variant="subBody"
          sx={{
            mr: 1,
            borderRadius: "100px"
          }}
        >
          {tag}
        </Text>
      ) : null}
    </Flex>
  );
}
export default NavigationItem;

export function SortableNavigationItem(
  props: PropsWithChildren<{ id: string } & NavigationItemProps>
) {
  const { id, ...restProps } = props;
  const { attributes, listeners, setNodeRef, transform, transition, active } =
    useSortable({ id });

  return (
    <NavigationItem
      {...restProps}
      containerRef={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        visibility: active?.id === id ? "hidden" : "visible"
      }}
      {...listeners}
      {...attributes}
    />
  );
}
