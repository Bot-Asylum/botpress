import { Callout, Intent, Tag } from '@blueprintjs/core'
import { ServerConfig } from 'common/typings'
import _ from 'lodash'
import React, { FC, useEffect, useState } from 'react'
import { connect } from 'react-redux'
import api from '~/api'
import PageContainer from '~/App/PageContainer'

import { fetchServerConfig } from '../../../reducers/server'

import Item from './Item'

const NOT_SET = 'Not set'

const getDisplayValue = (val: any) => {
  if (val === undefined || val === null) {
    return NOT_SET
  } else if (val === false || val === true) {
    return val.toString()
  } else {
    return val.length ? val.toString() : NOT_SET
  }
}

const isSet = (value: any): boolean => value !== NOT_SET

const protocol = window.location.protocol.substr(0, window.location.protocol.length - 1)

interface Props {
  serverConfig: ServerConfig
  serverConfigLoaded: boolean
  fetchServerConfig: () => void
}

const Container = props => {
  return (
    <PageContainer
      title="Production Checklist"
      superAdmin={true}
      helpText={
        <span>
          This is a checklist of recommended settings when running Botpress in production.
          <br /> Environment variables are displayed in <Tag>gray</Tag> and values from the botpress.config.json config
          file in <Tag intent={Intent.PRIMARY}>blue</Tag>
          <br />
          <br />
          Once your server is correctly setup, we recommend disabling this page by setting the environment variable
          BP_DISABLE_SERVER_CONFIG to "true"
        </span>
      }
    >
      {props.children}
    </PageContainer>
  )
}

export const Checklist: FC<Props> = props => {
  const [langSource, setLangSource] = useState<any>()
  const [hasAuditTrail, setAuditTrail] = useState(false)

  useEffect(() => {
    if (!props.serverConfigLoaded) {
      props.fetchServerConfig()
    }
    // tslint:disable-next-line: no-floating-promises
    loadData()
  }, [])

  const loadData = async () => {
    const { data: sources } = await api.getSecured().get('/admin/languages/sources')
    setLangSource(sources.languageSources)

    const { data: debug } = await api.getSecured().get('/admin/server/debug')
    const audit = Object.keys(debug)
      .filter(x => x.startsWith('bp:audit'))
      .map(x => debug[x])

    setAuditTrail(_.some(audit, Boolean))
  }

  if (!props.serverConfig) {
    return (
      <Container>
        <Callout intent={Intent.PRIMARY}>
          Server configuration is disabled. To view this page, set the environment variable "BP_DISABLE_SERVER_CONFIG"
          to false
        </Callout>
      </Container>
    )
  }

  const getEnv = (key: string): any => getDisplayValue(_.get(props.serverConfig.env, key))
  const getConfig = (path: string): any => getDisplayValue(_.get(props.serverConfig.config, path))
  const getLive = (path: string): any => getDisplayValue(_.get(props.serverConfig.live, path))

  const languageEndpoint = _.get(langSource, '[0].endpoint', '')

  return (
    <Container>
      <div className="checklist">
        <Item
          title="Enable Botpress Professional"
          docs="https://botpress.io/docs/pro/about-pro/"
          status={getEnv('PRO_ENABLED') === 'true' || getConfig('pro.enabled') === 'true' ? 'success' : 'warning'}
          source={[
            { type: 'env', key: 'PRO_ENABLED', value: getEnv('BP_PRODUCTION') },
            { type: 'env', key: 'BP_LICENSE_KEY', value: getEnv('BP_LICENSE_KEY') },
            { type: 'config', key: 'pro.enabled', value: getConfig('pro.enabled') },
            { type: 'config', key: 'pro.licenseKey', value: getConfig('pro.licenseKey') }
          ]}
        >
          Botpress Pro provides multiple features ready to be used in an enterprise-grade solution.
        </Item>

        <Item
          title="Use a Postgres database"
          docs="https://botpress.io/docs/tutorials/database/#how-to-switch-from-sqlite-to-postgres"
          status={getEnv('DATABASE_URL').startsWith('postgres') ? 'success' : 'warning'}
          source={[{ type: 'env', key: 'DATABASE_URL', value: getEnv('DATABASE_URL') }]}
        >
          By default, Botpress uses an SQLite database, which is not recommended in a production environment. Postgres
          is more resilient and allows to run Botpress in cluster mode (using multiple servers to handle the load).
        </Item>

        <Item
          title="Use the database BPFS storage"
          docs="https://botpress.io/docs/advanced/hosting/#overview"
          status={getEnv('BPFS_STORAGE') === 'database' ? 'success' : 'warning'}
          source={[{ type: 'env', key: 'BPFS_STORAGE', value: getEnv('BPFS_STORAGE') }]}
        >
          When this option is set, every bots and configuration files are stored in the database, and only that copy is
          edited when you make changes to them using the interface. This way, multiple servers can access the same
          up-to-date data at the same time.
        </Item>

        <Item
          title="Run Botpress in production mode"
          status={getEnv('BP_PRODUCTION') === 'true' ? 'success' : 'warning'}
          source={[{ type: 'env', key: 'BP_PRODUCTION', value: getEnv('BP_PRODUCTION') }]}
        >
          When you run Botpress in production, these changes happens:
          <ul>
            <li>Hide stack traces when error occurs</li>
            <li>Hides debug logs and logging of standard errors to optimize speed</li>
            <li>Optimizes some validations for speed</li>
            <li>Enables the use of multiple servers (cluster mode)</li>
          </ul>
        </Item>

        <Item
          title="Configure the external server URL"
          docs="https://botpress.io/docs/advanced/configuration/#exposing-your-bot-on-the-internet"
          status={isSet(getEnv('EXTERNAL_URL')) || isSet(getConfig('httpServer.externalUrl')) ? 'success' : 'warning'}
          source={[
            { type: 'env', key: 'EXTERNAL_URL', value: getEnv('EXTERNAL_URL') },
            { type: 'config', key: 'httpServer.externalUrl', value: getConfig('httpServer.externalUrl') }
          ]}
        >
          <span>
            This may cause multiple issues in production, like resources not displaying correctly or links not working.
            When it is not set, it defaults to http://localhost:3000. When using Botpress Professional, this value is
            also used to validate your license.
          </span>
        </Item>

        <Item
          title="Enable Redis support"
          status={isSet(getEnv('REDIS_URL')) && isSet(getEnv('CLUSTER_ENABLED')) ? 'success' : 'warning'}
          source={[
            { type: 'env', key: 'REDIS_URL', value: getEnv('REDIS_URL') },
            { type: 'env', key: 'CLUSTER_ENABLED', value: getEnv('CLUSTER_ENABLED') }
          ]}
        >
          Redis allows you to run multiple Botpress servers, all using the same data. Both variables below must be
          configured for Redis to work proprely
        </Item>

        <Item
          title="Restrict CORS to your own domain"
          status={
            getConfig('httpServer.cors.enabled') === 'false' || isSet(getConfig('httpServer.cors.origin'))
              ? 'success'
              : 'warning'
          }
          source={[
            { type: 'config', key: 'httpServer.cors.enabled', value: getConfig('httpServer.cors.enabled') },
            { type: 'config', key: 'httpServer.cors.origin', value: getConfig('httpServer.cors.origin') }
          ]}
        >
          By default, Botpress allows any origin to reach the server. You can either disable CORS completely (set the
          configuration to false), or set an allowed origin
        </Item>

        <Item
          title="Host your own language server"
          docs="https://botpress.io/docs/advanced/hosting/#language-server"
          status={languageEndpoint.includes('botpress.io') ? 'warning' : 'success'}
          source={[{ type: 'config', key: 'nlu.json: languageSources', value: languageEndpoint }]}
        >
          The default language server configured with Botpress is a public server, which has request limitations and
          should not be relied upon when serving customers. Please follow the instructions in our documentation to setup
          your own, then change the server URL in the configuration file <strong>global/data/config/nlu.json</strong>
        </Item>

        <Item
          title="Securing your server with HTTPS"
          docs="https://botpress.io/docs/advanced/hosting/#secure-configuration-for-the-nginx-server"
          status={protocol === 'https' ? 'success' : 'warning'}
          source={[{ key: 'Detected protocol', value: protocol }]}
        >
          Botpress doesn't handle certificates and https headers directly. Those should be handled by a NGINX server in
          front of it. We have a recommended NGINX configuration sample in the documentation.
        </Item>

        <Item
          title="Enable audit trail"
          docs="https://botpress.io/docs/advanced/configuration/#advanced-logging"
          status={hasAuditTrail ? 'success' : 'warning'}
        >
          You can enable a special debug scope that tracks every requests sent to the server (and the corresponding
          user/ip address) and output them to the log file. You can configure those scopes by clicking on 'Debug' in the
          menu on the left
        </Item>

        <Item
          title="Output logs to the filesystem"
          docs="https://botpress.io/docs/advanced/configuration/#logs-configuration"
          status={getConfig('logs.fileOutput.enabled') === 'true' ? 'success' : 'none'}
          source={[{ type: 'config', key: 'logs.fileOutput.enabled', value: getConfig('logs.fileOutput.enabled') }]}
        >
          By default, Botpress does some minimal logging to the database. It is recommended to enable the log output on
          the file system to keep traces
        </Item>

        <Item
          title="Change Botpress base path"
          docs="https://botpress.io/docs/advanced/configuration/#changing-the-base-url-of-your-bot"
          status={isSet(getLive('ROOT_PATH')) ? 'success' : 'none'}
          source={[{ key: 'Current base path', value: !isSet(getLive('ROOT_PATH')) ? '/' : getLive('ROOT_PATH') }]}
        >
          By default, all requests are handled at the top level of the external url. It is possible to change that path
          (for example to use http://localhost:3000/botpress). You can do that by updating your server's EXTERNAL_URL
          and adding the suffix at the end.
        </Item>

        <Item
          title="Create custom roles and review permissions"
          docs="https://botpress.io/docs/pro/rbac/#adding-a-new-role"
          status="none"
        >
          There is a default set of role and permissions when you create a workspace. It is recommended to review and
          update them.
        </Item>

        <Item
          title="Enable other authentication mechanism"
          docs="https://botpress.io/docs/advanced/authentication/#docsNav"
          status="none"
        >
          The default authentication method is a username/password, but you can enable additional authentication
          strategies to access Botpress. We currently support LDAP, SAML and OAUTH2.
        </Item>

        <Item
          title="Configure your Reverse Proxy and Load Balancing"
          docs="https://botpress.io/docs/advanced/hosting/#setting-up-nginx"
          status="none"
        >
          Check the documentation for more informations
        </Item>
      </div>
    </Container>
  )
}

const mapStateToProps = state => ({
  serverConfig: state.server.serverConfig
})

export default connect(
  mapStateToProps,
  { fetchServerConfig }
)(Checklist)