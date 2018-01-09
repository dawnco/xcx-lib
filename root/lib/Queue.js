class Queue {

    add(key, data, identity = "id", length = 20){
        var st = wx.getStorageSync(key) || [], nst = null

        var index = false;
        st.forEach((v, i)=>{
            if(v[identity] == data[identity]){
                index = i
            }
        })


        if (index !== false) {
            st.splice(index, 1)
        }


        st.push(data)

        var nst = st.slice(-st.length)
        wx.setStorageSync(key, nst)
    }

    get(key){
        var data = wx.getStorageSync(key) || []
        return data.reverse()
    }

    delete(key, index){
        var st = wx.getStorageSync(key) || [], nst = null
        st.splice(index, 1)
        wx.setStorageSync(key, st)
        return st
    }

}

export default Queue