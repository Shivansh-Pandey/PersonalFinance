using PersonalFinance.Models;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace PersonalFinance.Controllers
{
    public class PersonalFinanceController : Controller
    {
        // GET: PersonalFinance


        public ActionResult Save(PersonalFinanceModel personalfinancemodel)
        {
            try
            {
                var data = Newtonsoft.Json.JsonConvert.SerializeObject(personalfinancemodel);

                string strPath = Server.MapPath("~");
                strPath = strPath + "\\File";

                var dirParameter = strPath + "\\" + personalfinancemodel.Email + "_" + personalfinancemodel.Password + ".json";

                if (!Directory.Exists(strPath))
                    Directory.CreateDirectory(strPath);

                FileStream fParameter = new FileStream(dirParameter, FileMode.Create, FileAccess.Write);
                StreamWriter m_WriterParameter = new StreamWriter(fParameter);
                m_WriterParameter.BaseStream.Seek(0, SeekOrigin.End);
                m_WriterParameter.Write(data);
                m_WriterParameter.Flush();
                m_WriterParameter.Close();

                return RedirectToAction("Index", "Home");
            }
            catch (Exception ex)
            {
            }
           
            return RedirectToAction("Index", "Home");
        }
    }
}