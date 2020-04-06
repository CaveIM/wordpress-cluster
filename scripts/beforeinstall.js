var wpbfp = '${settings.wp_protect}' == 'true' ? "THROTTLE" : "OFF";

var resp = {
  result: 0,
  ssl: !!jelastic.billing.account.GetQuotas('environment.jelasticssl.enabled').array[0].value,
  nodes: [{
    nodeType: "storage",
    tag: "2.0-7.2",
    flexibleCloudlets: ${settings.st_flexibleCloudlets:8},
    fixedCloudlets: ${settings.st_fixedCloudlets:1},
    diskLimit: ${settings.st_diskLimit:100},
    nodeGroup: "storage",
    displayName: "Storage",
    cluster: true,
    count: 3
  }]
}

if (${settings.galera:false}) {
  resp.nodes.push({
    nodeType: "mariadb-dockerized",
    tag: "10.3.20",
    count: 3,
    flexibleCloudlets: ${settings.db_flexibleCloudlets:8},
    fixedCloudlets: ${settings.db_fixedCloudlets:1},
    diskLimit: ${settings.db_diskLimit:10},
    nodeGroup: "sqldb",
    displayName: "Galera cluster",
    restartDelay: 5,
    skipNodeEmails: true,
    env: {
      ON_ENV_INSTALL: "",
      JELASTIC_PORTS: "4567,4568,4444"
    }
  })
}

if (!${settings.galera:false}) {
  resp.nodes.push({
    nodeType: "mariadb-dockerized",
    tag: "10.3.20",
    count: 2,
    flexibleCloudlets: ${settings.db_flexibleCloudlets:8},
    fixedCloudlets: ${settings.db_fixedCloudlets:1},
    diskLimit: ${settings.db_diskLimit:10},
    nodeGroup: "sqldb",
    skipNodeEmails: true,
    displayName: "DB Server"
  })
}

if (${settings.ls-addon:false}) {
  resp.nodes.push({
    nodeType: "litespeedadc",
    tag: "2.6",
    count: 1,
    flexibleCloudlets: ${settings.bl_flexibleCloudlets:8},
    fixedCloudlets: ${settings.bl_fixedCloudlets:1},
    diskLimit: ${settings.bl_diskLimit:10},
    nodeGroup: "bl",
    scalingMode: "STATEFUL",
    displayName: "Load balancer",
    env: {
      WP_PROTECT: wpbfp,
      WP_PROTECT_LIMIT: 100
    }
  }, {
    nodeType: "litespeedphp",
    tag: "5.4.4-php-7.4.1",
    count: ${settings.cp_count:2},
    flexibleCloudlets: ${settings.cp_flexibleCloudlets:16},
    fixedCloudlets: ${settings.cp_fixedCloudlets:1},
    diskLimit: ${settings.cp_diskLimit:10},
    nodeGroup: "cp",
    scalingMode: "STATELESS",
    displayName: "AppServer",
    env: {
      SERVER_WEBROOT: "/var/www/webroot/ROOT",
      REDIS_ENABLED: "true",
      WAF: "${settings.waf:false}",
      WP_PROTECT: "OFF"
    },
    volumes: [
      "/var/www/webroot/ROOT"
    ]  
  })
}

if (!${settings.ls-addon:false}) {
  resp.nodes.push({
    nodeType: "nginx-dockerized",
    tag: "1.16.1",
    count: 1,
    flexibleCloudlets: ${settings.bl_flexibleCloudlets:8},
    fixedCloudlets: ${settings.bl_fixedCloudlets:1},
    diskLimit: ${settings.bl_diskLimit:10},
    nodeGroup: "bl",
    scalingMode: "STATEFUL",
    displayName: "Load balancer"
  }, {
    nodeType: "nginxphp-dockerized",
    tag: "1.16.1-php-7.4.2",
    count: ${settings.cp_count:2},
    flexibleCloudlets: ${settings.cp_flexibleCloudlets:8},                  
    fixedCloudlets: ${settings.cp_fixedCloudlets:1},
    diskLimit: ${settings.cp_diskLimit:10},
    nodeGroup: "cp",
    scalingMode: "STATELESS",
    displayName: "AppServer",
    env: {
      SERVER_WEBROOT: "/var/www/webroot/ROOT",
      REDIS_ENABLED: "true"
    },
    volumes: [
      "/var/www/webroot/ROOT",
      "/var/www/webroot/.cache",
      "/etc/nginx/conf.d/SITES_ENABLED"
    ]  
  })
}

return resp;
