import * as React from 'react';
import { TabContent, TabPane, Nav, NavItem, NavLink, Alert } from 'reactstrap';
import { Link, RouteComponentProps } from 'react-router-dom';
import { Page, Loader } from '../components';
import { Injector, KrasInjectorOptions } from './injector';
import { request } from '../utils';

export interface InjectorsParams {
  injector: string;
}

export interface InjectorsProps extends RouteComponentProps<InjectorsParams> {
  children?: React.ReactNode;
}

interface KrasInjector {
  name: string;
  active: boolean;
  options: KrasInjectorOptions;
}

interface KrasInjectors {
  injectors: Array<KrasInjector>;
}

interface InjectorsViewProps {
  data: KrasInjectors;
  injector?: string;
  children?: React.ReactNode;
}

interface InjectorsViewState {
  injectors: Array<KrasInjector>;
  activeTab: string;
}

class InjectorsView extends React.Component<InjectorsViewProps, InjectorsViewState> {
  constructor(props: InjectorsViewProps) {
    super(props);

    this.state = {
      injectors: props.data.injectors,
      activeTab: props.injector || props.data.injectors.map(inj => inj.name)[0],
    };
  }

  componentWillReceiveProps(nextProps: InjectorsViewProps) {
    if (nextProps.injector && nextProps.injector !== this.state.activeTab) {
      this.setState({
        activeTab: nextProps.injector,
      });
    }
  }

  private saveChanges(injector: KrasInjector, options: KrasInjectorOptions) {
    const { injectors } = this.state;
    const data: { [x: string]: any; } = {};

    for (const option of Object.keys(options)) {
      if (option && option[0] !== '_') {
        data[option] = options[option].value;
      }
    }

    request({
      method: 'PUT',
      url: `injector/${injector.name}`,
      body: JSON.stringify(data),
    });

    this.setState({
      injectors: injectors.map(inj => inj !== injector ? inj : ({
        ...injector,
        options,
      })),
    });
  }

  render() {
    const { injectors, activeTab } = this.state;

    if (injectors.length === 0) {
      return (
        <Alert color="warning">
          No injectors loaded.
        </Alert>
      );
    }

    return (
      <div>
        <Nav tabs>
          {
            injectors.map(injector => (
              <NavItem key={injector.name}>
                <NavLink
                  style={{ cursor: 'pointer' }}
                  tag={Link}
                  className={activeTab === injector.name ? 'active' : '' }
                  {...{ to: `/injectors/${injector.name}` }}>
                  {injector.name}
                </NavLink>
              </NavItem>
            ))
          }
        </Nav>
        <TabContent activeTab={activeTab}>
          {
            injectors.map(injector => (
              <TabPane tabId={injector.name} key={injector.name}>
                <Injector name={injector.name} active={injector.active} options={injector.options} onSaveChanges={({ options }) => this.saveChanges(injector, options)} />
              </TabPane>
            ))
          }
        </TabContent>
      </div>
    );
  }
}

export const Injectors = ({ match }: InjectorsProps) => (
  <Page title="Injectors" description="Injector specific settings and options to play around with.">
    <Loader component={InjectorsView} url="injector" forward={match.params} />
  </Page>
);
