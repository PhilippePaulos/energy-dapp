import { useAccount } from 'wagmi';
 
function Profile() {

  const { address, isConnected } = useAccount()

  return (
    <p>Coucou</p> 
  )

}

export default Profile;