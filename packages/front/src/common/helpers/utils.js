const leftJoin = (objArr1, objArr2, key1, key2) => objArr1.map(
    anObj1 => ({
        ...objArr2.find(
            anObj2 => anObj1[key1].toLowerCase() === anObj2[key2].toLowerCase()
        ),
        ...anObj1
    })
)

export { leftJoin }