import {
  useRef,
  useState,
  useEffect,
  useContext,
  Children,
  createContext,
  cloneElement
} from "react";

interface ITabsModifier {
  className?: string;
}

interface ITabsContainerProps extends ITabsModifier {
  [key: string]: any;
}

interface ITabsContainerState {
  activeIndex: number;
}

interface ITabsContext extends ITabsContainerState {
  onSelectTab: (x: number) => void;
}

/// Reference:
// ---
//
// https://developers.google.com/web/fundamentals/accessibility/focus/using-tabindex
// http://simplyaccessible.com/article/danger-aria-tabs/
// https://inclusive-components.design/tabbed-interfaces/

const TabContext = createContext<ITabsContext>({
  activeIndex: 0,
  onSelectTab: null
} as ITabsContext);

export function Container({ className, ...props }: ITabsContainerProps) {
  const [activeIndex, selectTabIndex] = useState(0);

  return (
    <TabContext.Provider
      value={{
        activeIndex,
        onSelectTab: selectTabIndex
      }}>
      <div className={className} {...props}>
        {props.children}
      </div>
    </TabContext.Provider>
  );
}

interface ITabsList extends ITabsModifier {
  [key: string]: any;
}

export function List(props: ITabsList): JSX.Element {
  const context = useContext<ITabsContext>(TabContext);
  const cloned = Children.map(
    props.children,
    (child: React.ReactElement<any>, index: number) => {
      return cloneElement(child, {
        isActive: index === context.activeIndex,
        onSelect: () => context.onSelectTab(index)
      });
    }
  );
  return (
    <div className={props.className} role="tablist">
      {cloned}
    </div>
  );
}

interface ITabsListItem extends ITabsModifier {
  isActive?: boolean;
  isDisabled?: boolean;
  onSelect?: () => void;
  id: string;
  [key: string]: any;
}

export function ListItem({
  isActive,
  isDisabled,
  id,
  onSelect,
  children,
  className,
  ...props
}: ITabsListItem): JSX.Element {
  return (
    <div
      id={id}
      role="tab"
      aria-selected={isActive}
      tabIndex={isActive ? 0 : -1}
      className={`${className} ${
        isDisabled ? "disabled" : isActive ? "active" : ""
      }`}
      onClick={isDisabled ? null : onSelect}
      onKeyPress={(event) => {
        if (event.key === "Enter") {
          return isDisabled ? null : onSelect();
        }
      }}
      {...props}>
      {children}
    </div>
  );
}

interface ITabsPanels extends ITabsModifier {
  isActive?: boolean;
  children: React.ReactNode;
}

export function Panels({ children, className }: ITabsPanels): JSX.Element {
  const context = useContext<ITabsContext>(TabContext);
  const cloned = Children.map(children, (child: React.ReactElement<any>, index) => {
    return cloneElement(child, {
      isActive: index === context.activeIndex,
      onSelect: () => context.onSelectTab(index)
    });
  });
  return <div className={className}>{cloned}</div>;
}

interface ITabsPanelProps extends ITabsModifier {
  isActive?: boolean;
  label: string;
  children: React.ReactNode;
}

export function Panel(props: ITabsPanelProps) {
  const ref = useRef(null);

  useEffect(() => {
    const node = ref.current;
    if (props.isActive) {
      node.focus();
    } else {
      node.blur();
    }
  });

  const activeStyle: React.CSSProperties = {
    display: props.isActive ? "block" : "none"
  };

  return (
    <div
      ref={ref}
      className={props.className}
      role="tabpanel"
      aria-hidden={!props.isActive}
      style={activeStyle}
      aria-labelledby={props.label}>
      {props.children}
    </div>
  );
}
