//数据产生类
class DataSource{
	constructor(){
		let i=0;
		this._limit=10;
		this._id=setInterval(()=>{
			this.emit(i++);
		},200);
	}

	emit(i){
		if(this.ondata){
			this.ondata(i);
		}
		if(i==this._limit){
			if(this.oncomplete){
				this.oncomplete(i)
			}
			this.destory();
		}
	}
	destory(){
		clearInterval(this._id);
	}
}

//观察者修饰工厂
class CommonObserverFactory{
	//传入被修饰的观察者
	constructor(destination){
		this.destination=destination;
	}
	next(i){
		if(!this.isUnsubscribed&&this.destination.next){
			try{
				this.destination.next(i);
			}catch(e){
				this.unsubscribe();
				console.error(e);
				throw e;
			}
			
		}
	}
	complete(){
		if(!this.isUnsubscribed&&this.destination.complete){
			try{
				this.destination.complete();
			}catch(e){
				this.unsubscribe();
				console.error(e);
				throw e;
			}
			this.unsubscribe();
			
		}
	}
	error(err){
		if(!this.isUnsubscribed&&this.destination.error){
			try{
				this.destination.error(err);
			}catch(e){
				this.unsubscribe();
				console.error(e);
				throw e;
			}
			this.unsubscribe();
			
		}
	}
	//取消订阅
	unsubscribe(){
		this.isUnsubscribed=true;
		//查看是否有取消的函数，有的话，则执行；
		if(this.unsub){
			this.unsub();
		}
	}

}

//被观察者操作类。
class Observable{
	//初始化函数，用于包装用户的oberver	
	constructor(_subscribe){
		//订阅类型，核心，数据处理
		this._subscribe=_subscribe;
	}

	//订阅操作，并且返回可取消订阅的接口
	subscribe(observer){
		const commonObserver=new CommonObserverFactory(observer);
		return this._subscribe(commonObserver);
	}

}

const myObervable=new Observable((observer)=>{
	const dataSource=new DataSource();
	dataSource.ondata=(e)=>{
		observer.next(e)
	}
	dataSource.oncomplete=()=>{
		observer.complete();
	}
	dataSource.onerror=(err)=>{
		observer.error(err)
	}
	observer.unsub=()=>{
		dataSource.destory();
	}
	return observer.unsubscribe.bind(observer);

})
myObervable.subscribe({
	next(x) { console.log(x); },
  error(err) { console.error(err); },
  complete() { console.log('done')}
})