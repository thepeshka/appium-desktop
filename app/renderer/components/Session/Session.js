import { shell } from 'electron';
import React, { Component } from 'react';
import _ from 'lodash';
import NewSessionForm from './NewSessionForm';
import SavedSessions from './SavedSessions';
import AttachToSession from './AttachToSession';
import ServerTabAutomatic from './ServerTabAutomatic';
import ServerTabSauce from './ServerTabSauce';
import ServerTabCustom from './ServerTabCustom';
import ServerTabTestobject from './ServerTabTestobject';
import ServerTabHeadspin from './ServerTabHeadspin';
import ServerTabBrowserstack from './ServerTabBrowserstack';
import ServerTabBitbar from './ServerTabBitbar';
import { Tabs, Button, Spin, Icon } from 'antd';
import { ServerTypes } from '../../actions/Session';
import AdvancedServerParams from './AdvancedServerParams';
import SessionStyles from './Session.css';
import CloudProviders from '../../../shared/cloud-providers';

const {TabPane} = Tabs;

export default class Session extends Component {

  state = {visibleProviders: {}};

  componentWillMount () {
    const {setLocalServerParams, getSavedSessions, setSavedServerParams, getRunningSessions} = this.props;
    (async () => {
      this.checkProvidersVisibility();
      await getSavedSessions();
      await setSavedServerParams();
      await setLocalServerParams();
      getRunningSessions();
    })();
  }

  async checkProvidersVisibility () {
    const visibleProviders = {};
    for (let [providerName, provider] of _.toPairs(CloudProviders)) {
      if (await provider.isVisible()) {
        visibleProviders[providerName] = true;
      }
    }
    this.setState({
      ...this.state,
      visibleProviders
    });
  }

  render () {
    const {newSessionBegan, savedSessions, tabKey, switchTabs,
      changeServerType, serverType, server,
      requestSaveAsModal, newSession, caps, capsUUID, saveSession, isCapsDirty,
      sessionLoading, attachSessId} = this.props;
    const { visibleProviders } = this.state || {};

    const isAttaching = tabKey === 'attach';

    const sauceTabHead = <span className={SessionStyles.tabText}><img src="images/sauce_logo.svg" /></span>;
    const testObjectTabHead = <span className={SessionStyles.tabText}><img src="images/testobject_logo.svg" /></span>;
    const headspinTabHead = <span className={SessionStyles.tabText}><img src="images/headspin_logo.svg" /></span>;
    const browserstackTabHead = <span className={SessionStyles.tabText}><img src="images/browserstack_logo.svg" /></span>;
    const bitbarTabHead = <span className={SessionStyles.tabText}><img src="images/bitbar_logo.svg" /></span>;
    newSession(null, attachSessId);
    return <Spin spinning={!!sessionLoading}>
      <div className={SessionStyles['session-container']}>
        <div id='serverTypeTabs'>
          <Tabs activeKey={serverType} onChange={changeServerType} className={SessionStyles.serverTabs}>
            <TabPane disabled={!server.local.port} tab='Automatic Server' key={ServerTypes.local}>
              <ServerTabAutomatic {...this.props} />
            </TabPane>
            <TabPane tab='Custom Server' key={ServerTypes.remote}>
              <ServerTabCustom {...this.props} />
            </TabPane>
            { visibleProviders.saucelabs && <TabPane tab={sauceTabHead} key={ServerTypes.sauce}>
              <ServerTabSauce {...this.props} />
            </TabPane> }
            { visibleProviders.testobject && <TabPane tab={testObjectTabHead} key={ServerTypes.testobject}>
              <ServerTabTestobject {...this.props} />
            </TabPane> }
            { visibleProviders.headspin && <TabPane tab={headspinTabHead} key={ServerTypes.headspin}>
              <ServerTabHeadspin {...this.props} />
            </TabPane> }
            { visibleProviders.browserstack && <TabPane tab={browserstackTabHead} key={ServerTypes.browserstack}>
              <ServerTabBrowserstack {...this.props} />
            </TabPane> }
            {visibleProviders.bitbar && <TabPane tab={bitbarTabHead} key={ServerTypes.bitbar}>
              <ServerTabBitbar {...this.props} />
            </TabPane>}
          </Tabs>
          <AdvancedServerParams {...this.props} />
        </div>


        {newSessionBegan && <div key={2}>
          <p>Session In Progress</p>
        </div>}

        {!newSessionBegan && <Tabs activeKey={tabKey} onChange={switchTabs} className={SessionStyles.scrollingTabCont}>
          <TabPane tab='Desired Capabilities' key='new' className={SessionStyles.scrollingTab}>
            <NewSessionForm {...this.props} />
          </TabPane>
          <TabPane tab={`Saved Capability Sets (${savedSessions.length})`} key='saved' className={SessionStyles.scrollingTab} disabled={savedSessions.length === 0}>
            <SavedSessions {...this.props} />
          </TabPane>
          <TabPane tab='Attach to Session...' key='attach' className={SessionStyles.scrollingTab}>
            <AttachToSession {...this.props} />
          </TabPane>
        </Tabs>}
        <div className={SessionStyles.sessionFooter}>
          <div style={{float: 'left'}}>
            <a href="#" onClick={(e) => e.preventDefault() || shell.openExternal("https://github.com/appium/appium/blob/master/docs/en/writing-running-appium/caps.md")}>
              <Icon type='link' />&nbsp;
              Desired Capabilities Documentation
            </a>
          </div>
          { (!isAttaching && capsUUID) && <Button onClick={() => saveSession(caps, {uuid: capsUUID})} disabled={!isCapsDirty}>Save</Button> }
          {!isAttaching && <Button onClick={requestSaveAsModal}>Save As...</Button>}
          {!isAttaching && <Button type="primary" id='btnStartSession'
            onClick={() => newSession(caps)} className={SessionStyles['start-session-button']}>Start Session</Button>
          }
          {isAttaching &&
            <Button type="primary" disabled={!attachSessId} onClick={() => newSession(null, attachSessId)}>
              Attach to Session
            </Button>
          }
        </div>
      </div>
    </Spin>;
  }
}
