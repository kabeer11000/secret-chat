// import {getDatabase} from "../../utils/db";

export default async function handler(req, res) {
    // const node = await getDatabase();
    //
    // const data = 'Hello, ' + Math.random()
    // const results = node.add(data)
    // console.log(results)
    // const hash = await db.add("world")
    // console.log(hash)

    res.status(200).json({name: 'John Doe'})
}