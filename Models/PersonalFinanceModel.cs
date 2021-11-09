using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace PersonalFinance.Models
{
    public class PersonalFinanceModel
    {
        public PersonalFinanceModel()
        {
            this.paycheckInformation = new PaycheckInformation();
        }
        public string PreviousEmail { get; set; }
        public string PreviousPassword { get; set; }

        public PaycheckInformation paycheckInformation { get; set; }
        public string Email { get; set; }
        public string Password { get; set; }

       

    }
}