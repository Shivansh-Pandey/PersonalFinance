using PersonalFinance.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace PersonalFinance.Controllers
{
    public class HomeController : Controller
    {
        public ActionResult Index()
        {
            List<SelectListItem> payperiod = new List<SelectListItem>()
            {
                new SelectListItem {Text = "Bi-Weekly", Value = "biweekly"},
                new SelectListItem {Text = "Semi-Monthly", Value = "semimonthly"}
            };
            ViewData["payperiod"] = payperiod;
            return View();
        }


    }
}