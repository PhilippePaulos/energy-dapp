function Details({id}) {

    const { chain } = useNetwork()

    const { abi, addr } = getContractDescription('EnergyDao', chain.id)

    const { data, isError, isLoading } = useContractRead({
        address: addr,
        abi: abi,
        functionName: 'getProject',
        args: [id],
        watch: true
      })

      console.log(data);


    return (<></>)
}

export default Details