using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace Web.Controllers
{
    public class HomeController : Controller
    {
        public ActionResult Index()
        {
            return View();
        }

       public ActionResult Screen()
        {
            var location = Request.QueryString["Location"];
            if (!string.IsNullOrEmpty(location))
            {
                location = "demo";
            }

            Session["Location"] = location;

            
            return View();
        }
    }
}