import * as React from "react";

interface ITabContext {
  activeIndex: number;
  onSelectTab: (value: number) => void;
}

interface ITabProps {
  isActive: boolean;
  isDisabled?: boolean;
  onSelect: () => void;
}

const TabContext = React.createContext({
  activeIndex: 0,
  onSelectTab: null
} as ITabContext);

export class Container extends React.Component {
  state = {
    activeIndex: 0
  };

  getContext(): ITabContext {
    return {
      activeIndex: this.state.activeIndex,
      onSelectTab: this.selectTabIndex
    };
  }

  selectTabIndex = activeIndex => {
    this.setState({ activeIndex });
  };

  render() {
    const value = this.getContext();
    return (
      <TabContext.Provider value={value}>
        <div className="Tabs">{this.props.children}</div>;
      </TabContext.Provider>
    );
  }
}

export const List: React.SFC = ({ children }) => (
  <TabContext.Consumer>
    {context => {
      const cloned = React.Children.map(children, (child, index) => {
        return React.cloneElement(child as React.ReactElement<any>, {
          isActive: index === context.activeIndex,
          onSelect: () => context.onSelectTab(index)
        });
      });
      return <div className="tabs">{cloned}</div>;
    }}
  </TabContext.Consumer>
);

export const ListItem: React.SFC<ITabProps> = ({
  isActive,
  isDisabled,
  onSelect
}) => (
  <div
    className={isDisabled ? "tab disabled" : isActive ? "tab active" : "tab"}
    onClick={isDisabled ? null : onSelect}>
    {this.props.children}
  </div>
);

export const Panels: React.SFC = ({ children }) => (
  <TabContext.Consumer>
    {context => {
      return <div className="panels">{children[context.activeIndex]}</div>;
    }}
  </TabContext.Consumer>
);

export class Panel extends React.Component {
  render() {
    return this.props.children;
  }
}

/**
 * 
  <Tabs.Container>
    <Tabs.List>
      <Tab.ListItem>Thing</Tab.ListItem>
      <Tab.ListItem>Thing</Tab.ListItem>
    </Tabs.List>
    <Tabs.Panels>
      <Tabs.Panel>Thing Content</Tabs.Panel>
      <Tabs.Panel>Thing Content</Tabs.Panel>
    </Tabs.Panels>
  </Tabs.Container>
 */
