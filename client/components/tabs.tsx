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

export class Container extends React.Component<
  ITabsContainerProps,
  ITabsContainerState
> {
  public readonly state: ITabsContainerState = {
    activeIndex: 0
  };

  private getContext(): ITabsContext {
    return {
      activeIndex: this.state.activeIndex,
      onSelectTab: this.selectTabIndex
    };
  }

  private selectTabIndex = (activeIndex: number): void => {
    this.setState({ activeIndex });
  };

  public render(): JSX.Element {
    const value = this.getContext();
    const { className, ...props } = this.props;
    return (
      <TabContext.Provider value={value}>
        <div className={className} {...props}>
          {this.props.children}
        </div>
      </TabContext.Provider>
    );
  }
}

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

export class Panel extends React.Component<ITabsPanelProps> {
  private ref: React.RefObject<HTMLDivElement> = React.createRef();

  public componentDidUpdate(): void {
    const node = this.ref.current;
    if (this.props.isActive) {
      node.focus();
    } else {
      node.blur();
    }
  }

  public render(): JSX.Element {
    const { isActive, className, children, label } = this.props;
    return (
      <div
        ref={this.ref}
        className={className}
        role="tabpanel"
        aria-hidden={!isActive}
        style={{ display: isActive ? "block" : "none" }}
        aria-labelledby={label}>
        {children}
      </div>
    );
  }
}
