using Common.Models;
using PetaPoco;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Common
{
    public class ClientService
    {
        public int AddClient(Client client)
        {
            int rt = 0;
            try
            {

                Database db = new Database("POVDB");
                rt = db.ExecuteScalar<int>("insert DeviceClient (WeixinImage,weixinOpenId) values ('" + client.WeixinImage + "','" + client.WeixinOpenId + "');select @@identity");
                
            }
            catch (Exception e)
            {
                throw new Exception( e.Message);
            }
            return rt;
        }

        public bool UpdateClient(Client client)
        {
            bool state = false;
            try
            {
                Database db = new Database("POVDB");
                db.Execute("update DeviceClient set isPlay=1 where id=@0", client.Id);
                state = true;
                
            }
            catch (Exception e)
            {
                throw new Exception(e.Message);
            }
            return state;
        }
    }
}
