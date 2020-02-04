/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import { checkLicenseGenerator } from './cluster_alerts/check_license';
import { hasMonitoringCluster } from './es_client/instantiate_client';

/*
 * Expose xpackInfo for the Monitoring cluster as server.plugins.monitoring.info
 */
export const initMonitoringXpackInfo = async ({ config, xpackMainPlugin, log }) => {
  const xpackInfo = hasMonitoringCluster(config)
    ? xpackMainPlugin.createXPackInfo({
        clusterSource: 'monitoring',
        pollFrequencyInMillis: config.get('monitoring.xpack_api_polling_frequency_millis'),
      })
    : xpackMainPlugin.info;

  xpackInfo.feature('monitoring').registerLicenseCheckResultsGenerator(checkLicenseGenerator);

  // check if X-Pack is installed on Monitoring Cluster
  const xpackInfoTest = await xpackInfo.refreshNow();
  if (!xpackInfoTest.isAvailable()) {
    log.warning(
      `X-Pack Monitoring Cluster Alerts will not be available: ${xpackInfoTest.unavailableReason()}`
    );
  }

  return xpackInfo;
};
