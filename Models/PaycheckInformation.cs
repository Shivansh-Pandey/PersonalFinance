using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace PersonalFinance.Models
{
    public class PaycheckInformation
    {
        public PaycheckInformation()
        {
            PayPeriod = "biweekly";
        }
        public DateTime? LastPayDate { get;set;}
        public string PayPeriod { get; set; }
        public decimal? GrossAmount { get; set; }
        public string NetAmount { get; set; }
        public string Current401kContribution { get; set; }
        public string YTD401kContribution { get; set; }
        public string Doesyouremployeroffer401kmatch { get; set; }
    }

}