import * as React from "react";

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

const TabContext = React.createContext({
  activeIndex: 0,
  onSelectTab: null
} as ITabsContext);

export const Container: React.FC<ITabsContainerProps> = function({
  className,
  ...props
}) {
  const [activeIndex, selectTabIndex] = React.useState(0);

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
};

interface ITabsList extends ITabsModifier {
  [key: string]: any;
}

export const List: React.FC<ITabsList> = ({ children, className }) => (
  <TabContext.Consumer>
    {(context: ITabsContext): JSX.Element => {
      const cloned = React.Children.map(
        children,
        (child: React.ReactElement<any>, index: number) => {
          return React.cloneElement(child, {
            isActive: index === context.activeIndex,
            onSelect: () => context.onSelectTab(index)
          });
        }
      );
      return (
        <div className={className} role="tablist">
          {cloned}
        </div>
      );
    }}
  </TabContext.Consumer>
);

interface ITabsListItem extends ITabsModifier {
  isActive?: boolean;
  isDisabled?: boolean;
  onSelect: () => void;
  id: string;
  [key: string]: any;
}

export const ListItem: React.FC<ITabsListItem> = ({
  isActive,
  isDisabled,
  id,
  onSelect,
  children,
  className,
  ...props
}) => (
  <div
    id={id}
    role="tab"
    aria-selected={isActive}
    tabIndex={isActive ? 0 : -1}
    className={`${className} ${isDisabled ? "disabled" : isActive ? "active" : ""}`}
    onClick={isDisabled ? null : onSelect}
    onKeyPress={event => {
      if (event.key === "Enter") {
        return isDisabled ? null : onSelect();
      }
    }}
    {...props}>
    {children}
  </div>
);

interface ITabsPanels extends ITabsModifier {
  isActive?: boolean;
}

export const Panels: React.FC<ITabsPanels> = ({ children, className }) => (
  <TabContext.Consumer>
    {context => {
      const cloned = React.Children.map(
        children,
        (child: React.ReactElement<any>, index) => {
          return React.cloneElement(child, {
            isActive: index === context.activeIndex,
            onSelect: () => context.onSelectTab(index)
          });
        }
      );
      return <div className={className}>{cloned}</div>;
    }}
  </TabContext.Consumer>
);

interface ITabsPanelProps extends ITabsModifier {
  isActive?: boolean;
  label: string;
}

export const Panel: React.FC<ITabsPanelProps> = function(props) {
  const ref = React.useRef(null);

  React.useEffect(() => {
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
};
