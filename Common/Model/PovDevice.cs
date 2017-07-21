using DogNet.Repositories;
using PetaPoco;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace Common.Models
{
    [PetaPoco.TableName("PovDevice")]
    [PetaPoco.PrimaryKey("Id")]
    public class PovDevice : Repository<PovDevice>
    {
        public int Id { get; set; }

        public string ShopName { get; set; }

        public string Number { get; set; }

        public string Address { get; set; }

        public string State { get; set; }

        public string DeviceName { get; set; }

        public DateTime CreateTime { get; set; }

        private bool connected = false;
        [Ignore]
        public bool Connected
        {
            get
            {
                return connected;
            }
            set
            {
                connected = value;
            }
        }
        private string workstate = "off";
        [Ignore]
        public string WorkState
        {
            get
            {
                return workstate;
            }
            set
            {
                workstate = value;
            }
        }
        [Ignore]
        public Queue<Client> ClientMisstion { get; set; }



        public PovDevice()
        {
            ClientMisstion = new Queue<Client>();
        }
    }
}