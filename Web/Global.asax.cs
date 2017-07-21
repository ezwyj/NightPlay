using System;
using System.Collections.Generic;
using System.Configuration;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.Web.Optimization;
using System.Web.Routing;

namespace Web
{
    public class MvcApplication : System.Web.HttpApplication
    {
        private static string appId = ConfigurationManager.AppSettings["WeixinAppId"];
        private static string appSecret = ConfigurationManager.AppSettings["WeixinAppSecret"];

        public static string WeiXinAppId { get { return appId; } }
        public static string WeiXinSecret { get { return appSecret; } }
        protected void Application_Start()
        {
            AreaRegistration.RegisterAllAreas();
            FilterConfig.RegisterGlobalFilters(GlobalFilters.Filters);
            RouteConfig.RegisterRoutes(RouteTable.Routes);
            BundleConfig.RegisterBundles(BundleTable.Bundles);
        }
    }
}
